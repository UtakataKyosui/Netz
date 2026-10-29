# evidence-research

## Purpose

Netzが本人専用・追加費用ゼロでテーマ調査を実行するための、evidence-researchに関する観測可能な契約を定義する。既存Issueの実装予定を表し、現時点で実装・実機検証が済んだことを意味しない。

## ADDED Requirements

### Requirement: 証拠に基づく充足判定

システムは各criterionへmet / unmet / unknownとsourceIds・判断理由を付けなければならない（MUST）。1件以上の必須項目がすべてmetの場合だけisSufficient=trueとcompleteを許可しなければならない（MUST）。

#### Scenario: 十分な証拠

- **WHEN** 全必須回答が実取得の出典で裏づけられ、鮮度・独立性・対象条件・矛盾の要件を満たす
- **THEN** completeとして早期終了でき、任意項目の不足は明記する

#### Scenario: 証拠不足または矛盾

- **WHEN** 必須条件がunmetかunknown、または結論を左右する未解消矛盾がある
- **THEN** 十分とは判定せず、残り予算で不足を優先して調査する

### Requirement: 停止と部分結果

システムは予算・無料枠・手段が尽きた場合に収集を停止しなければならない（MUST）。有用な証拠があればpartial、なければfailedとして理由を残し、停止を十分条件の充足と扱ってはならない（MUST NOT）。

#### Scenario: 上限到達

- **WHEN** 必須項目が未充足で検索または推論の予算が尽きる
- **THEN** 条件を緩めず部分・失敗レポートへ移行する

#### Scenario: 新情報が増えない

- **WHEN** 検索しても必須条件を満たす証拠が増えない
- **THEN** 停止理由を明記し、検索回数や停滞だけでcompleteにはしない

### Requirement: 非断定とレポートの検証

システムは未発見と不存在、未調査と調査済み、事実と推測を区別しなければならない（MUST）。最終レポートのsourceId参照と判定整合性を検証しなければならない（MUST）。

#### Scenario: 見つからない情報

- **WHEN** 対象の存在を裏づける情報が取得できなかった
- **THEN** 存在しないと断定せず、取得範囲と不足を明記する

#### Scenario: 推論予算ゼロ

- **WHEN** 追加のLLM呼び出しができない
- **THEN** 証拠台帳と既知の不足からテンプレートで部分・失敗レポートを生成する
