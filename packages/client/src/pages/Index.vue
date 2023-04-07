<template>
  <div w100vw h100vh fcc>
    <button button-base class="mx-10" @click="() => $router.push('/svgLoading')">
      SvgLoading
    </button>
    <button button-base class="mx-10" @click="() => $router.push('/flyBox')">
      FlyBox
    </button>
    <button button-base class="mx-10" @click="() => $router.push('/fullContainer')">
      FullContainer
    </button>
    <button button-base class="mx-10" @click="() => $router.push('/waterfallsFlow')">
      WaterfallsFlow
    </button>
  </div>
</template>
