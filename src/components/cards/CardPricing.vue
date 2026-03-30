<template>
  <div class="pc" :class="{'pc--pop': popular}">
    <div v-if="popular" class="pc__badge">Most Popular</div>

    <div class="pc__head">
      <div class="pc__plan">{{ title }}</div>
      <div class="pc__tag">{{ subtitle }}</div>
    </div>

    <div class="pc__price-block">
      <div class="pc__price">
        <span class="pc__currency">$</span>
        <span class="pc__amount">{{ formatWhole(price) }}</span>
        <span v-if="hasCents(price)" class="pc__cents">.{{ formatCents(price) }}</span>
      </div>
      <div class="pc__interval">{{ price_text }}</div>
      <div v-if="price_savings" class="pc__savings">{{ price_savings }}</div>
    </div>

    <p class="pc__desc">{{ description }}</p>

    <q-btn
      v-if="active"
      :to="link"
      :label="popular ? 'Get Started' : 'Select Plan'"
      no-caps
      unelevated
      class="full-width pc__cta"
      :class="{'pc__cta--pop': popular}"
    />
    <q-btn
      v-else
      label="Coming Soon"
      no-caps
      flat
      class="full-width pc__cta pc__cta--off"
      disabled
    />

    <ul v-if="features && features.length" class="pc__features">
      <li v-for="f in features" :key="f">
        <q-icon name="check" size="14px" class="pc__check" />
        <span>{{ f }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  title: {type: String, default: 'Plan'},
  subtitle: {type: String, default: ''},
  description: {type: String, default: ''},
  price: {type: Number, default: 0},
  price_text: {type: String, default: ''},
  price_savings: {type: String, default: ''},
  active: {type: Boolean, default: true},
  link: {
    type: Object,
    default: () => ({path: '/instances', query: {plan: 'monthly'}})
  },
  popular: {type: Boolean, default: false},
  features: {type: Array, default: () => []}
})

function formatWhole(p) {
  return Math.floor(p)
}
function hasCents(p) {
  return p % 1 !== 0
}
function formatCents(p) {
  return String(p.toFixed(2)).split('.')[1]
}
</script>

<style scoped>
.pc {
  position: relative;
  padding: 1.75rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  transition: border-color 250ms, box-shadow 250ms, transform 250ms;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pc:hover {
  border-color: rgba(178, 56, 255, 0.3);
  box-shadow: 0 16px 40px rgba(8, 2, 20, 0.4);
  transform: translateY(-2px);
}

/* ── Popular variant ── */
.pc--pop {
  border-color: rgba(255, 79, 216, 0.35);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 1px rgba(255, 79, 216, 0.15),
    0 20px 50px rgba(90, 30, 140, 0.35);
}

.pc--pop:hover {
  border-color: rgba(255, 79, 216, 0.5);
  box-shadow: 0 0 0 1px rgba(255, 79, 216, 0.25),
    0 24px 60px rgba(90, 30, 140, 0.45);
}

.pc__badge {
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.2rem 0.85rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: linear-gradient(
    135deg,
    var(--q-primary, #b238ff),
    var(--q-accent, #ff4fd8)
  );
  color: #fff;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(178, 56, 255, 0.3);
}

/* ── Header ── */
.pc__head {
  margin-bottom: 1.25rem;
}

.pc__plan {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.01em;
}

.pc__tag {
  font-size: 0.78rem;
  color: rgba(244, 238, 255, 0.45);
  margin-top: 0.15rem;
}

/* ── Price ── */
.pc__price-block {
  margin-bottom: 1.25rem;
}

.pc__price {
  display: flex;
  align-items: baseline;
  gap: 0.1rem;
}

.pc__currency {
  font-size: 1.4rem;
  font-weight: 600;
  color: rgba(244, 238, 255, 0.5);
  align-self: flex-start;
  margin-top: 0.35rem;
}

.pc__amount {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  color: #fff;
  letter-spacing: -0.03em;
}

.pc__cents {
  font-size: 1.4rem;
  font-weight: 600;
  color: rgba(244, 238, 255, 0.5);
}

.pc__interval {
  font-size: 0.8rem;
  color: rgba(244, 238, 255, 0.4);
  margin-top: 0.3rem;
}

.pc__savings {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  background: rgba(56, 200, 120, 0.12);
  color: #38c878;
  border: 1px solid rgba(56, 200, 120, 0.2);
}

/* ── Description ── */
.pc__desc {
  margin: 0 0 1.5rem;
  font-size: 0.82rem;
  line-height: 1.55;
  color: rgba(244, 238, 255, 0.45);
  flex: 1;
}

/* ── CTA button ── */
.pc__cta {
  border-radius: 10px !important;
  font-weight: 700;
  font-size: 0.9rem;
  min-height: 44px;
  background: rgba(255, 255, 255, 0.08) !important;
  color: #fff !important;
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: background 200ms, border-color 200ms, box-shadow 200ms;
}
.pc__cta:hover {
  background: rgba(255, 255, 255, 0.13) !important;
  border-color: rgba(255, 255, 255, 0.22);
}

.pc__cta--pop {
  background: linear-gradient(
    135deg,
    var(--q-primary, #b238ff),
    var(--q-secondary, #6d3cff)
  ) !important;
  border: none;
  box-shadow: 0 4px 18px rgba(178, 56, 255, 0.25);
}
.pc__cta--pop:hover {
  box-shadow: 0 6px 24px rgba(178, 56, 255, 0.4);
}

.pc__cta--off {
  opacity: 0.4;
}

/* ── Feature checklist ── */
.pc__features {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 1.25rem;
}

.pc__features li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: rgba(244, 238, 255, 0.6);
}

.pc__check {
  color: var(--q-primary, #b238ff);
  flex-shrink: 0;
}
</style>
