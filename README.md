# Netz
AIによる情報収集によるナレッジ収集

## 仕様と開発フロー

OpenSpecで仕様・設計・実装タスクを管理します。[運用手順](docs/openspec-workflow.md)を参照してください。

```bash
pnpm add -g @fission-ai/openspec@latest
openspec status --change implement-research-workflow --json
openspec validate --all --strict --no-interactive
```

MVPの仕様は[作業中の変更](openspec/changes/implement-research-workflow/proposal.md)にまとめています。
実装中の細部変更は設計・差分仕様・タスクへ反映し、対応するIssueとPRに判断理由を残します。
現在は初期コードの段階であり、仕様の追加を実装完了とは扱いません。
以下のサービス一覧と図は初期構想です。採用状況・無料条件・計画承認を含む最新の要件はOpenSpecの変更とIssue #1〜#7を参照してください。

## WorkerのWorkflow

```mermaid
sequenceDiagram
    actor U as User
    participant C as Cloudflare
    participant CQ@{ "type" : "queue" } as Cloudflare Queues
    participant CWI as Cloudflare Worker AI
    participant W as Web
    participant N@{ "type": "database" } as Notion

    U ->> C: Message Send
    C ->> CQ: Queue Set
    CQ ->> CWI: Send Prompt(Request)

    activate CWI

    loop Search And Inference Loop
        CWI ->> W: Request Search Web Contents
        activate W
        W -->> CWI: Response Search Web Contents
        deactivate W

        CWI ->> CWI: Inference
    end

    deactivate CWI

    CWI ->> C: Response Inference Result

    C ->> N: Save Inference Result
    U ->> N: View Inference Result
```

## Cloudflareのサービスで使用する予定のもの

- [Queue](https://developers.cloudflare.com/queues/)
    - リクエスト順の管理
- [Workflows](https://developers.cloudflare.com/workflows/)
    - Cloudflare Worker上のLLMでのリクエストの扱いを整える
- [Browser Run](https://developers.cloudflare.com/browser-run/)
    - プログラムによって動的なウェブページや生のHTMLを読み込み、完全にレンダリングし、次のような特定の出力を取得
- [Providers](https://developers.cloudflare.com/web-search/providers/)
    - 検索プロバイダーを用いて検索できる
- [AI Search](https://developers.cloudflare.com/ai-search/)
    - 検索インフラ全体を構築することなく、あらゆるアプリケーションやエージェントに検索機能を追加
- [Agent Memory](https://developers.cloudflare.com/agent-memory/)
    - 話を取り込んでメモリを自動的に抽出したり、アプリケーションが保存すべき情報を既に把握している場合は、明示的に情報を記憶するため
- [Build Agents](https://developers.cloudflare.com/agents/)
    - Cloudflare上でエージェントを構築・ホストし、ブラウザ、サンドボックス、AI検索、MCP、決済、その他のMCPツールを備えた耐久性のあるエージェントランタイムに、チャット、音声、メール、Slack、Webhookを接続
