---
name: version-management
description: "changesets 기반 버전 관리/릴리스 흐름(Version Packages PR → npm publish)과, PR 머지 시 changeset 봇 커밋 때문에 발생하는 GitHub Actions 'action_required' 승인 이슈 대응법. Use when 새 changeset을 추가할 때, 'Version Packages' PR을 머지해야 할 때, PR이 CI는 다 통과한 것 같은데 mergeStateStatus가 BLOCKED로 안 풀릴 때, 또는 '버전 올려줘', 'release 진행', 'npm 배포' 같은 요청이 있을 때."
---

# Version Management (use-hooks)

`@jbpark/use-hooks`는 changesets로 버전을 관리하고 npm에 공개 배포된다(`private: false`).

## 릴리스 흐름

1. **changeset 추가**: 사용자 대상 변경(기능/버그 수정)이 있는 PR에는 `.changeset/*.md`가 필요하다. `pnpm changeset`으로 수동 생성하거나, `changeset-draft.yml` 워크플로우(필수 상태 체크 `draft`)가 PR별로 초안을 자동 생성/갱신해준다.
2. **Version Packages PR**: main에 push될 때마다 `version.yml`이 돌면서, 누적된 changeset들로 `changeset-release/main` 브랜치에 "🔖 chore: version packages" PR을 열고 최신 상태로 유지한다. 이 PR은 `package.json` 버전을 bump하고 `CHANGELOG.md`를 갱신한다.
3. **머지 시 자동 배포**: 이 PR을 머지하면 그 자체가 main에 대한 push이므로 `publish.yml`이 실행된다 — 현재 `package.json` 버전이 이미 `vX.Y.Z` 태그로 존재하는지 확인하고, 없으면: build → `npm publish`(OIDC Trusted Publishing이라 `NPM_TOKEN` 불필요) → git 태그 push → GitHub Release 생성(가능하면 GH Models로 릴리즈 노트 다듬기, 실패 시 원본 CHANGELOG 텍스트로 폴백).

⚠️ **npm publish는 공개적이고 되돌리기 어려운 배포다.** "Version Packages" PR(`changeset-release/main`)을 머지하기 전에는, 그게 다른 일반 기능 PR 머지와 다르다는 것 — 즉 "이 머지 = 실제 npm에 새 버전 배포"라는 것 — 을 사용자에게 명확히 알리고 별도로 확인받는다. 사용자가 먼저 "머지해줘"라고 명시적으로 말했더라도, 이 저장소에서는 매번 "지금 머지하면 npm에 vX.Y.Z가 배포됩니다"라고 재확인하는 게 안전하다.

## 필수 상태 체크와 "action_required" 함정

이 저장소의 브랜치 룰셋은 `lint-and-build (Node v24.x)`와 `draft` 두 체크를 필수로 요구한다 (`gh api repos/pjb0811/use-hooks/rulesets`로 확인 가능).

PR을 열면 `changeset-draft.yml`의 봇이 그 PR 브랜치에 커밋을 하나 더 push해서(예: draft changeset 파일 추가/갱신) `synchronize` 이벤트가 발생하는 경우가 있다. 이 새 커밋에 대해 CI/Changeset Draft 워크플로우가 재트리거되는데, 이 재트리거된 실행이 **`conclusion: action_required`, job 0개**인 채로 끝나버리는 경우가 있다 — 실제로는 아무 문제 없는 정상적인 재실행인데도 GitHub이 승인을 요구하며 멈춘 상태다. 이러면 필수 체크가 "완료"로 안 잡혀서 PR의 `mergeStateStatus`가 계속 `BLOCKED`로 남는다.

**해결 절차:**

```bash
# 1. 해당 브랜치의 실행 목록에서 action_required인 run을 찾는다
gh run list --branch <branch> --json databaseId,name,status,conclusion,headSha,event

# 2. 그 run을 API로 직접 승인한다 (CI/Changeset Draft 각각)
gh api -X POST repos/pjb0811/use-hooks/actions/runs/<run_id>/approve

# 3. 정상 완료를 지켜본다
gh run watch <run_id> --exit-status

# 4. 필수 체크가 다 통과했는지 확인
gh pr view <n> --json mergeable,mergeStateStatus   # CLEAN이면 머지 가능
```

## 브랜치 네이밍

Conventional Commits 접두어를 브랜치명에도 쓴다: `feat/*`, `fix/*`, `refactor/*`, `chore/*`.

⚠️ **함정**: git은 `feat`이라는 이름의 브랜치와 `feat/foo`라는 이름의 브랜치를 동시에 가질 수 없다 (`refs/heads/feat` vs `refs/heads/feat/foo` 경로 충돌). 새 브랜치를 만들기 전에 `git branch -a`로 접두어와 겹치는 bare 브랜치(`feat`, `fix` 등)가 남아있는지 확인한다. 있으면 대체 이름(`feature/*`)을 임시로 쓰거나, 사용자에게 그 낡은 브랜치를 지워도 되는지 먼저 물어본다 — 임의로 삭제하지 않는다.

## 참고

- 관련 워크플로우: `.github/workflows/changeset-draft.yml`, `.github/workflows/version.yml`, `.github/workflows/publish.yml`, `.github/workflows/ci.yml`
- 수동 릴리스 노트 재생성(태그는 있는데 Release가 없을 때): `.github/workflows/release.yml`을 `workflow_dispatch`로 실행 (`tag` 입력값 필요)
