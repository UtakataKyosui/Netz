# OpenSpecによる開発と仕様変更

## 基本開発ルール

このリポジトリでは、以下を標準の開発フローとする。Codex・Claude Code・人による実装に共通して適用する。

1. **タスクは基本的にGitHub Issueで管理する。** 目的、対象範囲、受入条件、依存関係、進捗、ブロッカー、後続作業をIssueへ集約する。実装に着手する前に対応Issueを特定し、未登録なら作成する。
2. **OpenSpecはIssueの要求を継承して実装を具体化する。** proposalに元Issueをリンクし、目的・スコープ・受入条件・依存を引き継ぐ。既存仕様との差分をspecs/scenariosへ、構成判断をdesignへ、実装手順と検証をtasksへ記載してから実装する。IssueとOpenSpecを別々の要求として運用しない。
3. **実装中の発見をOpenSpecへ取り込む。** 新たな技術制約、不具合、採用条件、未確認事項を、その根拠と影響範囲とともにdesignへ記録し、影響する実装を進める前に方針とtasksを更新する。実験によって方針を確かめる場合は、実験結果と採否も記録する。
4. **必要なら技術制約の除去・問題の直接解決を優先する。** 原因を調べ、依存更新、構成変更、実装修正などの選択肢を、効果・追加費用・リスク・作業量・検証可能性から評価する。実現可能で既存要件に適合する対処を採用する。
5. **直接解決が困難なら、根拠を残して回避策で実装する。** 困難な理由、比較した選択肢、採用する回避方法、残る制約、受入条件への影響、検証方法、解消を再検討する条件をdesignへ残す。必要な実装・検証をtasksへ追加し、残存課題は後続Issueへ結び付ける。回避策でも元の受入条件を満たすことを確認する。
6. **変更をIssueへ還流し、検証して完了する。** 目的・スコープ・受入条件・依存・ブロッカー・残存課題に影響する変更は対応Issueにも反映する。細かい実装手順はOpenSpecで扱い、Issueと二重に管理しない。PRにIssueとchangeをリンクし、受入条件と検証結果を照合して完了を判断する。

ここで取り除く対象は技術上の制約・実装上の障害であり、利用者が決めた要件を自動的に撤廃する意味ではない。
追加費用ゼロ・本人専用・共有予算・証拠付き十分条件などに適合する方法を選ぶ。
受入条件や外部動作の変更が必要な場合は、Issueの要求とdelta specs/scenariosを揃え、未承認の要件緩和を実装判断で行わない。
適合する直接解決も回避策も見つからない場合は、根拠と選択肢を残して該当タスクをblockedとし、依存しない作業を進める。

```mermaid
flowchart TD
  A["Issueの目的・受入条件"] --> B["OpenSpecへ継承・実装計画"]
  B --> C["実装・検証"]
  C --> D{"制約・問題を発見したか"}
  D -->|はい| E["OpenSpecに根拠・影響を記録"]
  E --> F{"直接解決できるか"}
  F -->|はい| G["制約除去・問題対処を設計"]
  F -->|困難| H["要件を満たす回避策を評価"]
  H --> I{"適合する回避策があるか"}
  I -->|はい| J["残存制約・検証・後続Issueを記録"]
  I -->|いいえ| K["blocked・選択肢をIssueへ共有"]
  G --> L["design・tasks・必要なspecsを更新"]
  J --> L
  L --> M["重要な変更をIssueへ反映"]
  M --> C
  D -->|いいえ| N["受入条件・検証を照合してPR"]
```

| 記録する内容 | 主な記録先 |
|---|---|
| 目的・要求・受入条件・進捗・ブロッカー・後続作業 | GitHub Issue |
| 元Issueと変更目的・範囲・依存の対応 | proposal |
| 外部から見える動作・受入シナリオ | delta specs/scenarios |
| 発見した制約、根拠、直接解決と回避策の比較、決定、残存制約 | design |
| 対処・回避の実装手順と検証結果 | tasks |
| 変更全体とIssue・OpenSpec・検証証跡の接続 | PR |

## 導入

pnpm方式を使用する。今回確認したCLIは1.15.0。最新版へ更新する際は生成物と検証結果の差分も確認する。

```bash
pnpm add -g @fission-ai/openspec@latest
openspec --version
```

PATHに入らない場合はpnpmのglobal bin設定を確認する。Nixとの二重導入は不要。
初期化済みのリポジトリでは再初期化は不要。Claude CodeとCodexの公式連携を同梱する。
生成物の更新は `openspec update --dry-run --json` で確認してから `openspec update` を実行する。
生成ファイルを直接カスタマイズせず、プロジェクト固有の指示をconfig.yamlとAGENTS.mdに置く。

## 仕様と進捗の役割

|場所|役割|
|---|---|
|`openspec/specs/<capability>/spec.md`|取り込まれた仕様。実装・実機確認の証明は別途必要|
|`openspec/changes/<change>/proposal.md`|目的・範囲・影響|
|`openspec/changes/<change>/specs/`|作業中の追加・変更・削除要件とシナリオ|
|`openspec/changes/<change>/design.md`|設計判断・検証根拠・採用条件|
|`openspec/changes/<change>/tasks.md`|実装・検証のチェックリスト|
|GitHub Issue / PR|作業管理・受入条件・仕様と証跡へのリンク|

初回changeのimplement-research-workflowはIssue #1〜#7の実装予定。OpenSpecの導入でアプリを実装済みにはしない。
Issueの詳細契約と差分仕様が食い違う場合は、差異を記録して揃えてから該当作業を進める。

## 開発開始

```bash
openspec list --specs
openspec list
openspec status --change implement-research-workflow --json
openspec instructions apply --change implement-research-workflow --json
openspec validate --all --strict --no-interactive
```

Claude Codeでは/opsx:propose、/opsx:apply、/opsx:update、/opsx:sync、/opsx:archiveを使用する。
Codexでは対応するopenspec-propose、openspec-apply-change、openspec-update-change等のスキルを使う。
スラッシュコマンドはシェルコマンドではない。
Coreにはverifyコマンドを含めていないため、シナリオと実装・テスト・実機結果の照合をPRで行う。

## 実装中の細部変更

```mermaid
flowchart TD
  A["実装中の発見・変更要求"] --> B{"外部の振る舞いが変わるか"}
  B -->|いいえ| C["design・tasksを更新"]
  B -->|はい| D{"同じ変更目的か"}
  D -->|はい| E["delta specs・design・tasksを更新"]
  D -->|いいえ| F["新しいchangeを作る"]
  C --> G["影響する実装・確認・Issueを更新"]
  E --> G
  F --> G
  G --> H["仕様形式の検証と動作確認"]
  H --> I{"仕様と実装が整合するか"}
  I -->|いいえ| A
  I -->|はい| J["PRで差分と根拠をレビュー"]
```

- 同じ目的のライブラリ選定・処理分割・設計詳細は、既存changeのdesignとtasksに理由・影響・確認方法を記録する。
- API、認証、処理上限、十分条件、失敗時動作が変わる場合は、delta specsとシナリオも同じPRで更新する。
- MODIFIEDは要件全体と既存シナリオを含める。部分上書きで例外条件を失わない。
- 目的が異なる変更や独立して完了できる変更は新しいchangeに分け、依存を記録する。
- 無料・本人専用・証拠付きの十分条件・調査計画承認の要件を細部変更として勝手に緩めない。変更要求がある場合は影響を明示して所有者と決定する。
- 未採用サービスの調査を実機検証済みと扱わない。
- 開発中の仕様変更と、利用者が承認した調査計画の実行中変更を区別する。後者は黙って変更しない。
- 実装差異を見つけたら、仕様を自動的にコードへ合わせず、バグか意図した変更かを判断して記録する。

## 変更の完了

statusのartifact完了はファイルが揃ったことを示し、実装済みを意味しない。
validateは形式検証であり、意味・認証・実接続の正しさを保証しない。

全実装・確認タスクとIssueの受入条件が揃ってから差分を現行仕様へ同期・archiveする。
CLIのarchiveは差分仕様の取り込みも行うため、実行前に変更対象を確認する。

```bash
openspec validate implement-research-workflow --strict --no-interactive
# 実装・検証がすべて完了してから実行
openspec archive implement-research-workflow --yes
openspec validate --all --strict --no-interactive
```

今回はarchiveしない。未完了タスク・外部検証をarchiveで隠さない。

## Issueとの対応

|Issue|capability|
|---|---|
|#1|全体統合|
|#2|cost-and-budget、実行基盤|
|#3|private-research-api、research-planning|
|#4|research-tools|
|#5|research-planning、evidence-research、cost-and-budget|
|#6|notion-reporting|
|#7|全capabilityの統合・障害・再開確認|

Issueはすべて[Netz](https://github.com/UtakataKyosui/Netz/issues)を参照する。
元Issueの詳細な採用基準・検証票は維持する。契約は差分仕様、構成判断はdesign、進捗と証跡はtasksに対応づける。
