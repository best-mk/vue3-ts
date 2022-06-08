<style lang="scss" scoped>
.scroller-wrap {
  ul {
    li {
      font-size: 16px;
      height: 50px;
      line-height: 50px;
      text-align: center;
      background-color: green;
      border-bottom: 1px solid #000;
      color: #fff;
    }
  }
}
</style>
<template>
  <div class="scroller">
    <div
      class="scroller-wrap"
      ref="wrapper"
      @touchstart.prevent="onStart"
      @touchmove.prevent="onMove"
      @touchend.prevent="onEnd"
      @touchcancel.prevent="onEnd"
      @mousedown.prevent="onStart"
      @mousemove.prevent="onMove"
      @mouseup.prevent="onEnd"
      @mousecancel.prevent="onEnd"
      @mouseleave.prevent="onEnd"
      @transitionend="onTransitionEnd"
    >
      <ul ref="scroller" :style="scrollerStyle">
        <li v-for="item in list" :key="item">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import { ref, defineComponent } from "vue";
interface DataType {
  list: number[];
  minY: number;
  maxY: number;
  wrapperHeight: number;
  duration: number;
  bezier: string;
  pointY: number;
  startY: number;
  offsetY: number;
  startTime: number;
  momentumStartY: number;
  momentumTimeThreshold: number;
  momentumYThreshold: number;
  isStarted: boolean;
}
export default defineComponent({
  // setup(props) {
  //   const wrapper = ref<null | HTMLInputElement>(null);
  //   const scroller = ref<null | HTMLInputElement>(null);
  // },
  name: "ScrollerDemo",
  data(): DataType {
    return {
      list: [],
      minY: 0,
      maxY: 0,
      wrapperHeight: 0,
      duration: 0,
      bezier: "linear",
      pointY: 0, // touchStart 手势 y 坐标
      startY: 0, // touchStart 元素 y 偏移值
      offsetY: 0, // 元素实时 y 偏移值
      startTime: 0, // 惯性滑动范围内的 startTime
      momentumStartY: 0, // 惯性滑动范围内的 startY
      momentumTimeThreshold: 300, // 惯性滑动的启动 时间阈值
      momentumYThreshold: 15, // 惯性滑动的启动 距离阈值
      isStarted: false, // start锁
    };
  },
  computed: {
    scrollerStyle(): any {
      return {
        transform: `translate3d(0, ${this.offsetY}px, 0)`,
        "transition-duration": `${this.duration}ms`,
        "transition-timing-function": this.bezier,
      };
    },
  },
  created() {
    let arr: number[] = [];
    for (let i = 0; i < 100; i++) {
      arr.push(i);
    }
    this.list = arr;
  },
  mounted() {
    //console.log(this);
    this.$nextTick(() => {
      this.wrapperHeight = (
        this as any
      ).$refs.wrapper.getBoundingClientRect().height;
      this.minY =
        this.wrapperHeight -
        (this as any).$refs.scroller.getBoundingClientRect().height;
    });
  },
  methods: {
    onStart(e: any) {
      const point = e.touches ? e.touches[0] : e;
      this.isStarted = true;
      this.duration = 0;
      this.stop();
      this.pointY = point.pageY;
      this.momentumStartY = this.startY = this.offsetY;
      this.startTime = new Date().getTime();
    },
    onMove(e: any) {
      if (!this.isStarted) return;
      const point = e.touches ? e.touches[0] : e;
      const deltaY = point.pageY - this.pointY;
      // this.offsetY = Math.round(this.startY + deltaY);
      // 浮点数坐标会影响渲染速度
      let offsetY = Math.round(this.startY + deltaY);
      // 超出边界时增加阻力
      if (offsetY < this.minY || offsetY > this.maxY) {
        offsetY = Math.round(this.startY + deltaY / 3);
      }
      this.offsetY = offsetY;
      const now = new Date().getTime();
      // 记录在触发惯性滑动条件下的偏移值和时间
      if (now - this.startTime > this.momentumTimeThreshold) {
        this.momentumStartY = this.offsetY;
        this.startTime = now;
      }
    },
    onEnd(e: any) {
      if (!this.isStarted) return;
      this.isStarted = false;
      if (this.isNeedReset()) return;
      const absDeltaY = Math.abs(this.offsetY - this.momentumStartY);
      const duration = new Date().getTime() - this.startTime;
      // 启动惯性滑动
      if (
        duration < this.momentumTimeThreshold &&
        absDeltaY > this.momentumYThreshold
      ) {
        const momentum = this.momentum(
          this.offsetY,
          this.momentumStartY,
          duration
        );
        this.offsetY = Math.round(momentum.destination);
        this.duration = momentum.duration;
        this.bezier = momentum.bezier;
      }
    },
    onTransitionEnd() {
      this.isNeedReset();
    },
    momentum(current: number, start: number, duration: number) {
      const durationMap: { [key: string]: any } = {
        noBounce: 2500,
        weekBounce: 800,
        strongBounce: 400,
      };
      const bezierMap: { [key: string]: any } = {
        noBounce: "cubic-bezier(.17, .89, .45, 1)",
        weekBounce: "cubic-bezier(.25, .46, .45, .94)",
        strongBounce: "cubic-bezier(.25, .46, .45, .94)",
      };
      let type = "noBounce";
      // 惯性滑动加速度
      const deceleration = 0.003;
      // 回弹阻力
      const bounceRate = 10;
      // 强弱回弹的分割值
      const bounceThreshold = 300;
      // 回弹的最大限度
      const maxOverflowY = this.wrapperHeight / 6;
      let overflowY;

      const distance = current - start;
      const speed = (2 * Math.abs(distance)) / duration;
      let destination =
        current + (speed / deceleration) * (distance < 0 ? -1 : 1);
      if (destination < this.minY) {
        overflowY = this.minY - destination;
        type = overflowY > bounceThreshold ? "strongBounce" : "weekBounce";
        destination = Math.max(
          this.minY - maxOverflowY,
          this.minY - overflowY / bounceRate
        );
      } else if (destination > this.maxY) {
        overflowY = destination - this.maxY;
        type = overflowY > bounceThreshold ? "strongBounce" : "weekBounce";
        destination = Math.min(
          this.maxY + maxOverflowY,
          this.maxY + overflowY / bounceRate
        );
      }

      return {
        destination,
        duration: durationMap[type],
        bezier: bezierMap[type],
      };
    },
    // 超出边界时需要重置位置
    isNeedReset() {
      let offsetY;
      if (this.offsetY < this.minY) {
        offsetY = this.minY;
      } else if (this.offsetY > this.maxY) {
        offsetY = this.maxY;
      }
      if (typeof offsetY !== "undefined") {
        this.offsetY = offsetY;
        this.duration = 500;
        this.bezier = "cubic-bezier(.165, .84, .44, 1)";
        return true;
      }
      return false;
    },
    // 停止滚动
    stop() {
      const matrix = window
        .getComputedStyle((this as any).$refs.scroller)
        .getPropertyValue("transform");
      if (matrix !== "none") {
        this.offsetY = Math.round(+matrix.split(")")[0].split(",")[5]);
      }
    },
  },
});
</script>
