#!/usr/bin/env sh

set -e

npm run build
cd public

# echo 'www.mingjie.ltd' > CNAME

git init
git add -A
git commit -m 'Deploy yibhou/blog to github.com/yibhou/blog.git'

# https://yibhou.github.io/
git push -f git@github.com:yibhou/yibhou.github.io.git master

# https://yibhou.github.io/blog/
# git push -f git@github.com:yibhou/blog.git master:gh-pages

# 返回上次的工作目录
cd -
