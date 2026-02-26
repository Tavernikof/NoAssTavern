<script setup>
defineProps({
  color: {
    type: String,
    default: "brand", // brand, danger, warning, success
  },
});
</script>

<template>
  <span :class="color">
    <slot />
  </span>
</template>

<style lang="scss" scoped>
$colors: (
  // Palette
    gray-1,
    gray-2,
    gray-3,
    gray-soft,
    indigo-1,
    indigo-2,
    indigo-3,
    indigo-soft,
    purple-1,
    purple-2,
    purple-3,
    purple-soft,
    green-1,
    green-2,
    green-3,
    green-soft,
    yellow-1,
    yellow-2,
    yellow-3,
    yellow-soft,
    red-1,
    red-2,
    red-3,
    red-soft,
    sponsor,
      // Background
    bg,
    bg-alt,
    bg-elv,
    bg-soft,
      // Borders
    border,
    divider,
    gutter,
      // Text
    text-1,
    text-2,
    text-3,
      // Function
    default-1,
    default-2,
    default-3,
    default-soft,
    brand-1,
    brand-2,
    brand-3,
    brand-soft,
    tip-1,
    tip-2,
    tip-3,
    tip-soft,
    note-1,
    note-2,
    note-3,
    note-soft,
    success-1,
    success-2,
    success-3,
    success-soft,
    important-1,
    important-2,
    important-3,
    important-soft,
    warning-1,
    warning-2,
    warning-3,
    warning-soft,
    danger-1,
    danger-2,
    danger-3,
    danger-soft,
    caution-1,
    caution-2,
    caution-3,
    caution-soft,
);

@each $color in $colors {
  .#{$color} {
    color: var(--vp-c-#{$color});
  }
}
</style>