# Git 工作流程文档

## 分支策略

本项目采用 **Git Flow** 简化版本的分支管理策略。

### 主要分支

#### 1. `main` 分支
- **用途**: 生产环境分支，存放稳定可发布的代码
- **保护**: 不允许直接提交，只能通过 Pull Request 合并
- **来源**: 从 `develop` 分支合并

#### 2. `develop` 分支
- **用途**: 开发主分支，集成所有开发完成的功能
- **保护**: 建议通过 Pull Request 合并
- **来源**: 从功能分支合并

### 辅助分支

#### 功能分支 (Feature Branches)
- **命名规范**: `feature/<功能名称>`
- **示例**: `feature/user-auth`, `feature/ai-planning`
- **来源**: 从 `develop` 创建
- **合并到**: `develop`
- **用途**: 开发新功能

#### 修复分支 (Fix Branches)
- **命名规范**: `fix/<问题描述>`
- **示例**: `fix/login-bug`, `fix/api-error`
- **来源**: 从 `develop` 创建（或紧急修复时从 `main` 创建）
- **合并到**: `develop` (或 `main` 和 `develop`)
- **用途**: 修复 bug

## 工作流程

### 开发新功能

```bash
# 1. 确保 develop 是最新的
git checkout develop
git pull origin develop

# 2. 创建功能分支
git checkout -b feature/user-auth

# 3. 开发并提交
git add .
git commit -m "feat: implement user authentication"

# 4. 推送到远程
git push origin feature/user-auth

# 5. 在 GitHub 创建 Pull Request 到 develop
# 6. Code Review 通过后合并到 develop
```

### 修复 Bug

```bash
# 1. 从 develop 创建修复分支
git checkout develop
git pull origin develop
git checkout -b fix/login-error

# 2. 修复并提交
git add .
git commit -m "fix: resolve login validation error"

# 3. 推送并创建 PR
git push origin fix/login-error
```

### 发布到生产环境

```bash
# 1. 确保 develop 分支测试通过
git checkout develop
git pull origin develop

# 2. 合并到 main
git checkout main
git pull origin main
git merge develop

# 3. 打标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags
```

## Commit 规范 (Conventional Commits)

### Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: add voice input feature` |
| `fix` | Bug 修复 | `fix: resolve API timeout issue` |
| `docs` | 文档更新 | `docs: update API documentation` |
| `style` | 代码格式（不影响功能） | `style: format code with prettier` |
| `refactor` | 代码重构 | `refactor: simplify auth logic` |
| `perf` | 性能优化 | `perf: optimize map rendering` |
| `test` | 测试相关 | `test: add unit tests for utils` |
| `build` | 构建系统或依赖 | `build: upgrade vite to v5.0` |
| `ci` | CI/CD 配置 | `ci: add github actions workflow` |
| `chore` | 其他杂项 | `chore: update dependencies` |

### Commit 示例

```bash
# 好的示例 ✅
git commit -m "feat(auth): implement user registration with email validation"
git commit -m "fix(map): resolve marker positioning bug on mobile devices"
git commit -m "docs: add setup instructions to README"
git commit -m "refactor(api): extract LLM service into separate module"

# 不好的示例 ❌
git commit -m "update"
git commit -m "fix bug"
git commit -m "add new feature"
```

### 详细 Commit Message 示例

```bash
git commit -m "feat(voice): add voice recognition with iFLYTEK API

- Integrate iFLYTEK speech recognition service
- Add voice recording UI with waveform animation
- Implement real-time transcription display
- Handle API errors gracefully

Closes #123"
```

## 代码审查清单

在创建 Pull Request 之前，请确保：

- [ ] 代码符合项目代码规范（通过 ESLint 检查）
- [ ] 所有新功能都有相应的测试
- [ ] Commit message 遵循 Conventional Commits 规范
- [ ] 没有将 API 密钥或敏感信息提交到代码库
- [ ] 功能在本地测试通过
- [ ] 更新了相关文档
- [ ] PR 描述清晰，说明了改动的目的和方法

## 最佳实践

### 1. 保持 Commit 简洁明了
- 每个 commit 只做一件事
- Commit message 清晰描述改动
- 频繁提交，便于回滚

### 2. 及时同步代码
```bash
# 定期从 develop 拉取最新代码
git checkout feature/your-feature
git fetch origin
git rebase origin/develop
```

### 3. 解决冲突
```bash
# 发生冲突时
git pull origin develop
# 手动解决冲突
git add .
git commit -m "chore: resolve merge conflicts"
```

### 4. 保持分支整洁
```bash
# 功能合并后删除本地分支
git branch -d feature/completed-feature

# 删除远程分支
git push origin --delete feature/completed-feature
```

## 常用命令速查

```bash
# 查看分支
git branch -a

# 切换分支
git checkout <branch-name>

# 创建并切换分支
git checkout -b <new-branch>

# 查看状态
git status

# 查看提交历史
git log --oneline --graph

# 暂存修改
git stash
git stash pop

# 撤销修改
git checkout -- <file>  # 撤销工作区修改
git reset HEAD <file>   # 撤销暂存区修改

# 修改最后一次提交
git commit --amend

# 查看差异
git diff
git diff --staged
```

## 紧急情况处理

### 回滚 Commit
```bash
# 回滚最后一次 commit（保留修改）
git reset --soft HEAD~1

# 回滚最后一次 commit（丢弃修改）
git reset --hard HEAD~1
```

### 紧急修复生产环境 Bug
```bash
# 1. 从 main 创建 hotfix 分支
git checkout main
git checkout -b hotfix/critical-bug

# 2. 修复并提交
git commit -m "fix: resolve critical production bug"

# 3. 合并到 main 和 develop
git checkout main
git merge hotfix/critical-bug
git checkout develop
git merge hotfix/critical-bug

# 4. 删除 hotfix 分支
git branch -d hotfix/critical-bug
```

---

**注意**: 始终保持代码库整洁，不要提交敏感信息！
