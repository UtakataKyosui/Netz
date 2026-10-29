# notion-reporting

## Purpose

Netzが本人専用・追加費用ゼロでテーマ調査を実行するための、notion-reportingに関する観測可能な契約を定義する。既存Issueの実装予定を表し、現時点で実装・実機検証が済んだことを意味しない。

## ADDED Requirements

### Requirement: 指定データベースへのレポート保存

システムは調査後に設定済みNotionデータベースの1依頼1ページとしてレポートを保存しなければならない（MUST）。任意の書き込みツールやモデルが示した保存先へ変更してはならない（MUST NOT）。

#### Scenario: 完全レポート

- **WHEN** 全必須条件がmetとなり、レポート検証が通る
- **THEN** テーマ・目的・範囲・項目別結果・条件評価・出典・限界・追加候補・実行情報を保存する

#### Scenario: 部分・失敗レポート

- **WHEN** 条件未充足または有用な証拠ゼロで停止する
- **THEN** partial / failedと停止理由を冒頭に明記し、保存可能なら不足・証拠とともに保存する

#### Scenario: 確認待ち

- **WHEN** 計画承認または明確化を待っている
- **THEN** 成果物ページは作成しない

### Requirement: 重複と保存結果不明の回復

システムはrequestIdとpage IDを対応づけ、同時再配信・再開でもページや本文を重複作成してはならない（MUST NOT）。応答喪失時は照合し、確定できなければsave_unknownで停止しなければならない（MUST）。

#### Scenario: 作成または追記後に応答喪失

- **WHEN** Notionが書き込んだ可能性があるが応答を受け取れない
- **THEN** 無条件に再作成・追記せず、照合または手動確認待ちへ移る

#### Scenario: 同じ依頼の再配信

- **WHEN** 既存成果物がある状態で保存処理を再実行する
- **THEN** 既存ページと反映済み本文を確認し、重複しない形で回復する

### Requirement: 調査結果と保存結果の分離

システムはresultStatus・sufficiencyEvaluation・stopReason・saveStatusを別に保持しなければならない（MUST）。保存を確認した場合だけsavedとページID・URLを返さなければならない（MUST）。

#### Scenario: 保存だけが失敗

- **WHEN** 十分な調査結果はあるがNotion操作が失敗する
- **THEN** 調査結果を保持し、保存成功を返さず、上限付きの回復対象とする

#### Scenario: Notionの制限

- **WHEN** 保存先の権限・容量・レート制限等に到達する
- **THEN** 無限再試行や有料化をせず、失敗を追跡可能にする
