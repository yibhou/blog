<template>
  <ParentFrontmatterKey></ParentFrontmatterKey>
</template>

<script>
import ParentFrontmatterKey from '@parent-theme/layouts/FrontmatterKey.vue'

export default {
  name: 'FrontmatterKey',

  components: {
    ParentFrontmatterKey
  },
  created () {
    // console.log('FrontmatterKey...')
    // console.log(this.$frontmatterKey)
  }
}
</script>
