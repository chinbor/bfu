<template>
  <div w100vw h100vh fcc flex-col>
    <button btn-base hover:btn-base-hover active:btn-base-active my-10px @click="() => $router.push('/demo1')">
      单一文件上传 [FORM-DATA] 未去重
    </button>
    <button btn-base hover:btn-base-hover active:btn-base-active my-10px @click="() => $router.push('/demo2')">
      单一文件上传 [BASE-64] 只适合图片 去重
    </button>
    <button btn-warning hover:btn-warning-hover active:btn-warning-active my-10px @click="() => $router.push('/demo3')">
      单一文件上传 [前端定义文件hash名] 去重
    </button>
    <button btn-error hover:btn-error-hover active:btn-error-active my-10px @click="() => $router.push('/demo4')">
      多文件上传 [进度管控] 未去重
    </button>
    <button btn-success hover:btn-success-hover active:btn-success-active my-10px @click="() => $router.push('/demo5')">
      Success
    </button>
  </div>
</template>
