# private-research-api

## Purpose

Netzが本人専用・追加費用ゼロでテーマ調査を実行するための、private-research-apiに関する観測可能な契約を定義する。既存Issueの実装予定を表し、現時点で実装・実機検証が済んだことを意味しない。

## ADDED Requirements

### Requirement: 本人専用のHTTP受付

すべての業務HTTPエンドポイントは所有者のBearerトークンを検証しなければならない（MUST）。未設定・空の認証設定は503、欠落・不一致の資格情報は401で拒否し、Queue・検索・推論・Notion操作を実行してはならない（MUST NOT）。

#### Scenario: 有効な依頼

- **WHEN** 所有者の有効な資格情報で正しいPOST /researchを送る
- **THEN** 投入成功時だけ202とrequestIdを返し、調査完了とは扱わない

#### Scenario: 認証を満たさない依頼

- **WHEN** 資格情報が不正、またはサーバーの認証設定がない
- **THEN** 定義したエラーを返し、下流処理と業務情報の公開を行わない

### Requirement: 入力と資格情報の保護

システムはprompt・mode・scope・任意の十分条件を実行時に検証し、入力の文字数・バイト数を制限しなければならない（MUST）。資格情報をURL・Queue・ログ・Notion・エラー応答へ含めてはならない（MUST NOT）。

#### Scenario: 入力エラー

- **WHEN** 空のprompt・不正な型・過大な本文を受け取る
- **THEN** Queueへ投入する前に4xxで拒否する

#### Scenario: 資格情報の交換

- **WHEN** 所有者がトークンを交換した
- **THEN** 旧トークンを拒否し、新トークンのみを受け付ける

### Requirement: 計画確認と状態参照

システムは認証付きの状態取得・計画修正・計画承認を提供しなければならない（MUST）。操作はrequestIdとplanVersionへ紐づけ、古い版・開始後の変更・期限切れの承認を拒否しなければならない（MUST）。

#### Scenario: 古い計画の承認

- **WHEN** expectedPlanVersionが現在の版に一致しない
- **THEN** 409で拒否して調査を開始しない

#### Scenario: 二重承認と再配信

- **WHEN** 同じ依頼を同時または繰り返し承認・配送する
- **THEN** 同じ計画の調査を二重に起動せず、使用済み予算を維持する
