# 配置 Vercel Blob 上传功能

## 问题：图片上传失败

错误信息："作品上传失败，请检查网络或稍后重试。"

## 原因

Vercel Blob 的环境变量 `BLOB_READ_WRITE_TOKEN` 没有配置。

## 解决步骤

### 1. 创建 Vercel Blob Store

1. 登录 Vercel Dashboard
2. 进入你的项目
3. 点击顶部菜单 **"Storage"**
4. 点击 **"Create Database"** 按钮
5. 选择 **"Blob"**（不是 Postgres）
6. 填写信息：
   - **Store Name**: `aigc-studio-blob`（或其他名称）
7. 点击 **"Create"**

### 2. 获取 BLOB_READ_WRITE_TOKEN

创建 Blob Store 后：

1. 在 Blob Store 详情页面
2. 找到 **"Access Tokens"** 或 **"Tokens"** 部分
3. 点击 **"Create Token"** 或查看现有 Token
4. 复制 Token 值（格式类似：`vercel_blob_xxx...`）

### 3. 配置环境变量

1. 在 Vercel Dashboard → 你的项目 → **Settings** → **Environment Variables**
2. 点击 **"Add New"**
3. 填写：
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: 粘贴刚才复制的 Token
   - **Environment**: 选择 **"Production"** 和 **"Preview"**（两个都选）
4. 点击 **"Save"**

### 4. 重新部署项目

**重要：** 添加环境变量后必须重新部署！

1. Vercel Dashboard → 你的项目 → **Deployments**
2. 找到最新的部署
3. 点击右侧的 **"..."** 菜单
4. 选择 **"Redeploy"**
5. 或者直接推送代码触发自动部署

### 5. 验证配置

重新部署后：

1. 刷新网站页面
2. 尝试上传一张图片（作品或封面图）
3. 如果成功，会显示 "✅ 作品上传成功！" 或 "✅ 封面图上传成功！"

## 测试上传 API

你可以在浏览器控制台测试：

```javascript
// 在浏览器控制台执行
fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    filename: 'test.jpg',
    contentType: 'image/jpeg',
  })
})
.then(r => r.json())
.then(d => console.log('✅ Upload API:', d))
.catch(e => console.error('❌ Upload API 失败:', e));
```

如果返回错误，查看错误信息定位问题。

## 常见错误

### 错误 1: "BLOB_READ_WRITE_TOKEN is not defined"

**原因：** 环境变量未配置

**解决：** 按照上面的步骤添加环境变量并重新部署

### 错误 2: "Invalid token"

**原因：** Token 值不正确

**解决：** 
- 重新生成 Token
- 确认复制完整（不要有空格或换行）
- 确认环境变量名称是 `BLOB_READ_WRITE_TOKEN`（注意大小写）

### 错误 3: "Access denied"

**原因：** Token 权限不足

**解决：** 
- 确认 Token 是 **"Read and Write"** 权限
- 重新创建 Token 并选择完整权限

## 完整配置清单

确保以下环境变量都已配置：

- [ ] `DATABASE_URL` - PostgreSQL 连接字符串
- [ ] `BLOB_READ_WRITE_TOKEN` - Vercel Blob 访问令牌

两个都必须配置，并且都要添加到 Production 环境。

## 完成！

配置完成后，所有图片上传功能都应该正常工作了：
- ✅ 封面图上传
- ✅ 未完成作品上传
- ✅ 已完成作品上传
- ✅ 参考图库上传


