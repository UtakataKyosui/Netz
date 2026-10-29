# research-planning

## Purpose

Netzが本人専用・追加費用ゼロでテーマ調査を実行するための、research-planningに関する観測可能な契約を定義する。既存Issueの実装予定を表し、現時点で実装・実機検証が済んだことを意味しない。

## ADDED Requirements

### Requirement: 調査前の計画と範囲

システムは収集前に目的、対象、対象外、必須・任意の問い、証拠要件、十分条件、利用予定経路を定義しなければならない（MUST）。明示条件、既定条件、AI補完の順で適用し、補完した仮定を記録しなければならない（MUST）。

#### Scenario: 曖昧なテーマ

- **WHEN** 目的の違いで対象や結論が大きく変わる依頼がある
- **THEN** modeに関係なくneeds_clarificationとして止まり、確認質問を返す

#### Scenario: 予算に対して広すぎる調査

- **WHEN** 必須項目を既定予算で扱えない
- **THEN** 黙って省略せず、範囲縮小または優先順位の確認を提示する

### Requirement: 計画の承認

システムはreviewを既定モードとし、本人が現在の計画を承認するまで検索・本文取得をしてはならない（MUST NOT）。autoでも明確な十分条件を確定してから収集しなければならない（MUST）。

#### Scenario: 既定の確認待ち

- **WHEN** promptだけで依頼し、計画が生成される
- **THEN** awaiting_approvalへ移り、承認まで外部収集を行わない

#### Scenario: 自動実行

- **WHEN** autoで明確な条件を指定する
- **THEN** 確定した条件と仮定を保持して収集へ進む

### Requirement: 十分条件の固定

システムは必須criterionを1件以上定義し、requirement、evidenceRequirement、acceptanceRuleを持たせなければならない（MUST）。開始後に不足を埋めるため条件を削除・緩和してはならない（MUST NOT）。

#### Scenario: 必須項目がない

- **WHEN** 条件が空または解釈不能である
- **THEN** 十分とは判定せず、入力エラーまたは確認待ちとする

#### Scenario: 実行中の範囲拡大

- **WHEN** 対象外の関連話題が見つかる
- **THEN** 今回の対象へ勝手に加えず、追加調査候補として残す
