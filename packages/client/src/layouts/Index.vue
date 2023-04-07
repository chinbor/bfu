<template>
  <main>
    <router-view v-slot="{ Component, route }">
      <transition
        enter-active-class="animate-fade-in animate-duration-300"
        leave-active-class="animate-fade-out animate-duration-300"
        mode="out-in"
      >
        <div>
          <component :is="Component" :key="route.name" />
        </div>
      </transition>
    </router-view>
  </main>
</template>
