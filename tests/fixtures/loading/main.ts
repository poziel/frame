import { createApp, defineComponent, h, onMounted, onUnmounted, ref } from "vue";
import { FrameLoader, FrameLoading, frameLoaderVariants } from "@frame/core";
import "../../../packages/core/src/style.css";

const active = ref(false), completed = ref(0), mounts = ref(0), unmounts = ref(0);
const initialLoading = ref(true), initialReady = ref(false), insideClicks = ref(0), large = ref(false);
const InitialChild = defineComponent({
  setup() {
    onMounted(() => { setTimeout(() => { initialReady.value = true; initialLoading.value = false; }, 400); });
    return () => h("p", { id: "initial-result" }, initialReady.value ? "Child initialized" : "Initializing");
  },
});
const Child = defineComponent({
  setup() {
    onMounted(() => { mounts.value++; });
    onUnmounted(() => { unmounts.value++; });
    return () => h("button", { id: "inside", onClick: () => { insideClicks.value++; } }, "Inside region");
  },
});
createApp({
  setup() {
    return () => h("main", { style: "padding:32px;color:#ddd;background:#181818;min-height:500px" }, [
      h("button", { id: "start", onClick: () => { active.value = true; setTimeout(() => { completed.value++; active.value = false; }, 1200); } }, "Start loading"),
      h("button", { id: "outside", onClick: () => { completed.value++; } }, "Outside region"),
      h("output", { id: "counts" }, `${mounts.value}/${unmounts.value}/${completed.value}`),
      h("output", { id: "inside-count" }, insideClicks.value),
      h(FrameLoading, { active: active.value, label: "Calculating", style: "height:180px", id: "region" }, { default: () => h(Child) }),
      h("div", { id: "gallery" }, frameLoaderVariants.map(variant => h(FrameLoader, { variant, label: variant, size: 32 }))),
      h(FrameLoading, { active: initialLoading.value, id: "initial-region" }, { default: () => h(InitialChild) }),
      h("button", { id: "change-loader", onClick: () => { large.value = !large.value; } }, "Change loader"),
      h(FrameLoader, { id: "dynamic-loader", variant: large.value ? "tailspin" : "ring", size: large.value ? 48 : 24, color: "red" }),
      ...(["above", "below", "left", "right"] as const).map(textPosition => h(FrameLoading, { active: true, id: `position-${textPosition}`, text: "Please wait", textPosition, style: "height:140px" }, () => "Content")),
      h(FrameLoading, { active: true, id: "text-only", text: "Text without animation", showLoader: false }),
      h(FrameLoading, { active: true, id: "loader-only", showText: false }),
      h(FrameLoading, { active: true, id: "custom-loader", text: "Custom animation" }, { loader: () => h("span", { id: "custom-indicator" }, "Custom") }),
      h(FrameLoading, { active: true, id: "custom-overlay", label: "Custom status" }, { overlay: () => h("span", { id: "custom-layout" }, "Entire custom layout") }),
    ]);
  },
}).mount("#app");
