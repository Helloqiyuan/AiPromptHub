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
 *         deleted:
 *           type: boolean
 *         createTime:
 *           type: string
 *           format: date-time
 *         updateTime:
 *           type: string
 *           format: date-time
 *     PromptAuthor:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         avatar:
 *           type: string
 *           nullable: true
 *         role:
 *           type: string
 *           nullable: true
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
 *           description: 父级分类 id，-1 表示根节点
 *         sort:
 *           type: integer
 *           nullable: true
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
 *           description: 封面图 URL（列表/卡片展示）
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
 *         deleted:
 *           type: boolean
 *         createTime:
 *           type: string
 *           format: date-time
 *         updateTime:
 *           type: string
 *           format: date-time
 *         author:
 *           $ref: '#/components/schemas/PromptAuthor'
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         tag:
 *           type: object
 *           nullable: true
 *           description: 兼容字段，等价于 tags 的第一项
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *         tags:
 *           type: array
 *           description: 关联标签（多对多 prompt_tag）
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *         models:
 *           type: array
 *           description: 兼容字段，当前恒为空数组
 *           items:
 *             type: object
 *         liked:
 *           type: boolean
 *         favorited:
 *           type: boolean
 *     PromptListResponse:
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
 *         deleted:
 *           type: boolean
 *         createTime:
 *           type: string
 *           format: date-time
 *         updateTime:
 *           type: string
 *           format: date-time
 *         author:
 *           $ref: '#/components/schemas/PromptAuthor'
 *         replyUser:
 *           $ref: '#/components/schemas/PromptAuthor'
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *     CommentListResponse:
 *       type: object
 *       properties:
 *         list:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *     Profile:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             stats:
 *               type: object
 *               properties:
 *                 promptCount:
 *                   type: integer
 *                 favoriteCount:
 *                   type: integer
 *                 commentCount:
 *                   type: integer
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
 */

/**
 * @openapi
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
 *         description: 登录成功并返回 JWT
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
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *               bio:
 *                 type: string
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
 *         description: 按标签筛选（Prompt 须包含该标签）
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
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
 *               content:
 *                 type: string
 *               usageScenario:
 *                 type: string
 *               exampleInput:
 *                 type: string
 *               exampleOutput:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               tagIds:
 *                 type: array
 *                 description: 标签 id 列表（多对多）；可与 tagId 二选一，优先 tagIds
 *                 items:
 *                   type: integer
 *               tagId:
 *                 type: integer
 *                 nullable: true
 *                 description: 单个标签（兼容旧客户端）
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
 *               content:
 *                 type: string
 *               usageScenario:
 *                 type: string
 *               exampleInput:
 *                 type: string
 *               exampleOutput:
 *                 type: string
 *               categoryId:
 *                 type: integer
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
 *     summary: 删除 Prompt（逻辑删除）
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
 */

/**
 * @openapi
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
 *     summary: 删除评论（支持递归删除回复）
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
 *               sort:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 创建成功
 */

/**
 * @openapi
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
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 后台 Prompt 分页数据
 *
 * /api/admin/prompts/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: 审核或变更 Prompt 状态
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 用户分页数据
 *
 * /api/admin/users/{id}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: 修改用户角色
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
