<template>
  <div class="post">
    <ParentPost></ParentPost>

    <!-- <Content />
    <Comment />
    <SimpleNewsletter v-if="$service.email.enabled" /> -->
  </div>
</template>

<script>
import ParentPost from '@parent-theme/layouts/Post.vue'
import { Comment } from '@vuepress/plugin-blog/lib/client/components'

export default {
  name: 'Post',

  components: {
    ParentPost,
    Comment
  },
  created () {
    // console.log('Post...')
    // console.log(this.$service)
  }
}
</script>
