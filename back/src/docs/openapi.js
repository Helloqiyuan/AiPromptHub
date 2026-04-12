/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ApiSuccess:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           example: 0
 *         message:
 *           type: string
 *           example: success
 *         data:
 *           nullable: true
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *         pageSize:
 *           type: integer
 *         total:
 *           type: integer
 *         totalPages:
 *           type: integer
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           nullable: true
 *         phone:
 *           type: string
 *           nullable: true
 *         avatar:
 *           type: string
 *           nullable: true
 *         bio:
 *           type: string
 *           nullable: true
 *         role:
 *           type: string
 *           enum: [user, admin, super_admin]
 *         status:
 *           type: string
 *           enum: [active, disabled]
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         parentId:
 *           type: integer
 *         sort:
 *           type: integer
 *     Tag:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *     Prompt:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         summary:
 *           type: string
 *           nullable: true
 *         image:
 *           type: string
 *           nullable: true
 *         content:
 *           type: string
 *         usageScenario:
 *           type: string
 *           nullable: true
 *         exampleInput:
 *           type: string
 *           nullable: true
 *         exampleOutput:
 *           type: string
 *           nullable: true
 *         userId:
 *           type: integer
 *         categoryId:
 *           type: integer
 *         likeCount:
 *           type: integer
 *         favoriteCount:
 *           type: integer
 *         commentCount:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [published, pending, rejected, archived]
 *         author:
 *           type: object
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         tag:
 *           type: object
 *           nullable: true
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tag'
 *         models:
 *           type: array
 *           items:
 *             type: object
 *         liked:
 *           type: boolean
 *         favorited:
 *           type: boolean
 *     PromptPage:
 *       type: object
 *       properties:
 *         list:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Prompt'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         promptId:
 *           type: integer
 *         userId:
 *           type: integer
 *         parentId:
 *           type: integer
 *         replyUserId:
 *           type: integer
 *           nullable: true
 *         content:
 *           type: string
 *         author:
 *           type: object
 *         replyUser:
 *           type: object
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *     CommentPage:
 *       type: object
 *       properties:
 *         list:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *     AdminStats:
 *       type: object
 *       properties:
 *         userCount:
 *           type: integer
 *         adminCount:
 *           type: integer
 *         categoryCount:
 *           type: integer
 *         promptCount:
 *           type: integer
 *         commentCount:
 *           type: integer
 *         favoriteCount:
 *           type: integer
 *         likeCount:
 *           type: integer
 */

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: 服务健康检查
 *     responses:
 *       200:
 *         description: 服务正常
 *
 * /api/users/register:
 *   post:
 *     tags: [Users]
 *     summary: 用户注册
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, passwordConfirm]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               passwordConfirm:
 *                 type: string
 *               phone:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: 注册成功
 *
 * /api/users/login:
 *   post:
 *     tags: [Users]
 *     summary: 用户登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登录成功，返回 token 和用户信息
 *
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: 获取当前用户信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 当前用户资料
 *   put:
 *     tags: [Users]
 *     summary: 更新当前用户资料
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 nullable: true
 *               phone:
 *                 type: string
 *                 nullable: true
 *               avatar:
 *                 type: string
 *                 nullable: true
 *               bio:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: 更新成功
 *
 * /api/users/me/prompts:
 *   get:
 *     tags: [Users]
 *     summary: 获取我的 Prompt 列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tagId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: parentCategoryId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 我的 Prompt 分页数据
 *
 * /api/users/me/favorites:
 *   get:
 *     tags: [Users]
 *     summary: 获取我的收藏列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 我的收藏分页数据
 *
 * /api/users/me/comments:
 *   get:
 *     tags: [Users]
 *     summary: 获取我的评论列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 我的评论分页数据
 */
/**
 * @openapi
 * /api/prompts:
 *   get:
 *     tags: [Prompts]
 *     summary: 获取 Prompt 列表
 *     description: 未登录默认只返回 published 状态，管理员可结合 status 参数筛选。
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tagId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: parentCategoryId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [published, pending, rejected, archived]
 *     responses:
 *       200:
 *         description: Prompt 分页数据
 *   post:
 *     tags: [Prompts]
 *     summary: 创建 Prompt
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               summary:
 *                 type: string
 *                 nullable: true
 *               image:
 *                 type: string
 *                 nullable: true
 *               content:
 *                 type: string
 *               usageScenario:
 *                 type: string
 *                 nullable: true
 *               exampleInput:
 *                 type: string
 *                 nullable: true
 *               exampleOutput:
 *                 type: string
 *                 nullable: true
 *               categoryId:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [published, pending, rejected, archived]
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               tagId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: 创建成功
 *
 * /api/prompts/{id}:
 *   get:
 *     tags: [Prompts]
 *     summary: 获取 Prompt 详情
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prompt 详情
 *   put:
 *     tags: [Prompts]
 *     summary: 更新 Prompt
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               summary:
 *                 type: string
 *                 nullable: true
 *               image:
 *                 type: string
 *                 nullable: true
 *               content:
 *                 type: string
 *               usageScenario:
 *                 type: string
 *                 nullable: true
 *               exampleInput:
 *                 type: string
 *                 nullable: true
 *               exampleOutput:
 *                 type: string
 *                 nullable: true
 *               categoryId:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [published, pending, rejected, archived]
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               tagId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: 更新成功
 *   delete:
 *     tags: [Prompts]
 *     summary: 删除 Prompt
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 *
 * /api/prompts/{id}/favorites/toggle:
 *   post:
 *     tags: [Prompts]
 *     summary: 切换收藏状态
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 收藏切换成功
 *
 * /api/prompts/{id}/likes/toggle:
 *   post:
 *     tags: [Prompts]
 *     summary: 切换点赞状态
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 点赞切换成功
 *
 * /api/comments:
 *   post:
 *     tags: [Comments]
 *     summary: 新增评论或回复
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [promptId, content]
 *             properties:
 *               promptId:
 *                 type: integer
 *               content:
 *                 type: string
 *               parentId:
 *                 type: integer
 *                 description: 回复时传父评论 id
 *     responses:
 *       200:
 *         description: 评论创建成功
 *
 * /api/comments/tree:
 *   get:
 *     tags: [Comments]
 *     summary: 获取评论树
 *     parameters:
 *       - in: query
 *         name: promptId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 评论树数据
 *
 * /api/comments/{id}:
 *   delete:
 *     tags: [Comments]
 *     summary: 删除评论
 *     description: 支持递归删除当前评论及其所有子回复。
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 */
/**
 * @openapi
 * /api/catalog/categories:
 *   get:
 *     tags: [Catalog]
 *     summary: 获取分类列表
 *     responses:
 *       200:
 *         description: 分类列表
 *   post:
 *     tags: [Catalog]
 *     summary: 创建分类
 *     description: 仅管理员可访问。
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               parentId:
 *                 type: integer
 *                 description: 根分类可传 -1
 *               sort:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 创建成功
 *
 * /api/catalog/tags:
 *   get:
 *     tags: [Catalog]
 *     summary: 获取标签列表
 *     responses:
 *       200:
 *         description: 标签列表
 *
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: 获取后台统计数据
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 后台统计数据
 *
 * /api/admin/prompts:
 *   get:
 *     tags: [Admin]
 *     summary: 获取后台 Prompt 列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tagId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: parentCategoryId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [published, pending, rejected, archived]
 *     responses:
 *       200:
 *         description: 后台 Prompt 分页数据
 *
 * /api/admin/prompts/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: 审核或更新 Prompt 状态
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [published, pending, rejected, archived]
 *     responses:
 *       200:
 *         description: 状态更新成功
 *
 * /api/admin/prompts/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: 后台删除 Prompt
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 *
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: 获取后台用户列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin, super_admin]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, disabled]
 *     responses:
 *       200:
 *         description: 用户分页数据
 *
 * /api/admin/users/{id}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: 修改用户角色
 *     description: 仅超级管理员可访问。
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin, super_admin]
 *     responses:
 *       200:
 *         description: 角色更新成功
 *
 * /api/admin/users/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: 修改用户状态
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, disabled]
 *     responses:
 *       200:
 *         description: 状态更新成功
 */

module.exports = {};
