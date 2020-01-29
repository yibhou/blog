<template>
  <div id="global-layout" class="vuepress-theme-blog">
    <ParentGlobalLayout></ParentGlobalLayout>
    <!-- <component :is="layout" /> -->
  </div>

</template>

<script>
import ParentGlobalLayout from '@parent-theme/layouts/GlobalLayout.vue'

export default {
  name: 'GlobalLayout',

  components: {
    ParentGlobalLayout
  },
  computed: {
    layout () {
      if (this.$page.path) {
        if (this.$frontmatter.layout) {
          return this.$frontmatter.layout
        } else {
          return 'Layout'
        }
      }
      return 'NotFound'
    }
  },
  created () {
    // console.log('GlobalLayout...')
    // console.log(this.$page)
    // console.log(this.$frontmatter)
  }
}
</script>
