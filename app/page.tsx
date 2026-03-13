'use client';

import { useState, useEffect } from 'react';

// ─── ローンチフロー定義 ─────────────────────────────────

interface Connection {
  appId: string;
  what: string; // 何を受け取る / 渡すか
}

interface AppStep {
  id: string;
  name: string;
  description: string;
  port: number;
  icon: string;
  phase: string;
  tips: string;
  inputsFrom: Connection[];  // このアプリを使う前に必要な情報元
  outputsTo: Connection[];   // このアプリの成果物を使う先
}

interface Phase {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  steps: AppStep[];
}

const PHASES: Phase[] = [
  {
    id: 'strategy',
    title: 'PHASE 1',
    subtitle: '戦略設計',
    color: '#6366F1',
    steps: [
      {
        id: 'movie',
        name: '動画分析（リサーチ）',
        description: '競合や参考動画を分析し、ローンチ設計のリサーチに活用する',
        port: 3200,
        icon: '🔍',
        phase: 'strategy',
        tips: '競合のプロモーション動画やセールス動画を分析。構成・訴求ポイント・CTAを研究して自分のローンチに活かす',
        inputsFrom: [],
        outputsTo: [
          { appId: 'concept', what: '競合分析・市場調査の結果' },
          { appId: 'postcreate', what: '動画から生成したSNS投稿素材' },
        ],
      },
      {
        id: 'concept',
        name: 'コンセプト設計',
        description: '商品コンセプト・ポジショニング・ターゲット設定を行う',
        port: 3900,
        icon: '🎯',
        phase: 'strategy',
        tips: '全ての土台。USP・ターゲット・ポジショニングを固める。ここが曖昧だと後の全工程がブレる',
        inputsFrom: [
          { appId: 'movie', what: '競合リサーチ結果' },
        ],
        outputsTo: [
          { appId: 'funnel', what: 'コンセプトシート・セールスポイント' },
          { appId: 'contentgift', what: 'ターゲット情報・商品コンセプト' },
          { appId: 'vsl', what: 'メッセージ・ペルソナ情報' },
          { appId: 'seminar', what: 'コンセプト・メッセージ' },
          { appId: 'salesconsultant', what: 'ペルソナ・セールスポイント' },
          { appId: 'lp', what: '商品情報・コピー素材' },
          { appId: 'postcreate', what: 'コンセプトシートHTML' },
        ],
      },
      {
        id: 'funnel',
        name: 'ファネル設計',
        description: 'ローンチ全体のファネル構造を設計する',
        port: 3800,
        icon: '🏗️',
        phase: 'strategy',
        tips: 'コンセプトが決まったら、集客→教育→販売の流れを設計。各ステップの役割・CVR目安・導線を明確にする',
        inputsFrom: [
          { appId: 'concept', what: 'コンセプト・セールスポイント' },
        ],
        outputsTo: [
          { appId: 'contentgift', what: '特典の用途・ポジション定義' },
          { appId: 'seminar', what: 'ファネル内のセミナー位置づけ' },
          { appId: 'vsl', what: 'ファネル内のVSLポジション' },
          { appId: 'lp', what: '必要なLP一覧・各LPの役割' },
          { appId: 'postcreate', what: '各ステップの集客方法' },
          { appId: 'finance', what: 'ファネル数値・CVR目安' },
        ],
      },
    ],
  },
  {
    id: 'content',
    title: 'PHASE 2',
    subtitle: 'コンテンツ制作',
    color: '#EC4899',
    steps: [
      {
        id: 'contentgift',
        name: 'リードマグネット',
        description: 'リスト獲得用の無料特典コンテンツを作成する',
        port: 3906,
        icon: '🎁',
        phase: 'content',
        tips: 'ファネルの入口。「無料でこれ？」と思わせるクオリティで、有料商品への架け橋になる特典を作る',
        inputsFrom: [
          { appId: 'concept', what: 'ターゲット情報・商品コンセプト' },
          { appId: 'funnel', what: '特典の用途（リスト獲得 or セミナー特典）' },
        ],
        outputsTo: [
          { appId: 'postcreate', what: '特典紹介用の投稿素材' },
          { appId: 'lp', what: 'オプトインLPに載せる特典情報' },
        ],
      },
      {
        id: 'vsl',
        name: 'VSL（動画セールスレター）',
        description: 'セールス動画の台本・構成を作成する',
        port: 3300,
        icon: '🎬',
        phase: 'content',
        tips: 'ファネルの中核。視聴者の問題意識→解決策→オファーの流れで購入意欲を高める',
        inputsFrom: [
          { appId: 'concept', what: 'メッセージ・ペルソナ・オファー内容' },
          { appId: 'funnel', what: 'ファネル内のVSLポジション' },
        ],
        outputsTo: [
          { appId: 'postcreate', what: 'VSL案内投稿の素材' },
          { appId: 'lp', what: 'セールスLPに埋め込む動画情報' },
        ],
      },
      {
        id: 'seminar',
        name: 'セミナー設計',
        description: 'ウェビナー・セミナーの構成を14BLOCKで設計する',
        port: 3904,
        icon: '🎤',
        phase: 'content',
        tips: 'セミナー型ファネルの場合はここ。14BLOCK構成で教育→信頼構築→オファーの流れを設計',
        inputsFrom: [
          { appId: 'concept', what: 'コンセプト・メッセージ' },
          { appId: 'funnel', what: 'ファネル内のセミナー位置づけ' },
        ],
        outputsTo: [
          { appId: 'salesconsultant', what: 'セミナー内容（事前教育レベル設定）' },
          { appId: 'postcreate', what: 'セミナー告知投稿の素材' },
          { appId: 'lp', what: 'セミナー申込LPの内容' },
        ],
      },
      {
        id: 'salesconsultant',
        name: '個別相談設計',
        description: '個別相談・セールスの台本を9フェーズで作成する',
        port: 3905,
        icon: '🤝',
        phase: 'content',
        tips: 'セミナー後や直接申込の個別相談フロー。ヒアリング→提案→反論処理→クロージングの台本を作る',
        inputsFrom: [
          { appId: 'concept', what: 'ペルソナ・セールスポイント' },
          { appId: 'seminar', what: 'セミナー内容（参加者の状態）' },
        ],
        outputsTo: [
          { appId: 'launchreport', what: '成約データ・商談分析結果' },
        ],
      },
    ],
  },
  {
    id: 'asset',
    title: 'PHASE 3',
    subtitle: 'アセット制作',
    color: '#F59E0B',
    steps: [
      {
        id: 'lp',
        name: 'LP制作',
        description: 'オプトイン・セミナー申込・セールスの各LPを構築する',
        port: 3903,
        icon: '📄',
        phase: 'asset',
        tips: 'ファネルの各ステップに必要なLPを作成。オプトインLP→セミナー申込LP→セールスLPの順で作ると効率的',
        inputsFrom: [
          { appId: 'concept', what: '商品情報・コピー素材' },
          { appId: 'funnel', what: '必要なLP一覧・各LPの役割' },
          { appId: 'contentgift', what: 'オプトインLPに載せる特典情報' },
          { appId: 'seminar', what: 'セミナー申込LPの内容' },
          { appId: 'vsl', what: 'セールスLPに埋め込む動画情報' },
        ],
        outputsTo: [
          { appId: 'postcreate', what: 'LP誘導用の投稿素材・URL' },
          { appId: 'marketing', what: '広告のランディング先URL' },
        ],
      },
    ],
  },
  {
    id: 'promotion',
    title: 'PHASE 4',
    subtitle: '集客・プロモーション',
    color: '#10B981',
    steps: [
      {
        id: 'marketing',
        name: 'マーケティング',
        description: '広告・マーケティング戦略を立案する',
        port: 3400,
        icon: '📊',
        phase: 'promotion',
        tips: '広告戦略・予算配分・ターゲティングを設計。Facebook/Instagram/Google広告の最適化',
        inputsFrom: [
          { appId: 'concept', what: 'ターゲット・ペルソナ情報' },
          { appId: 'lp', what: '広告のランディング先URL' },
        ],
        outputsTo: [
          { appId: 'finance', what: '広告費・予算データ' },
          { appId: 'launchreport', what: '広告チャンネル別KPI' },
        ],
      },
      {
        id: 'postcreate',
        name: '投稿作成',
        description: 'SNS投稿・メール/LINE配信文を作成する',
        port: 3901,
        icon: '✏️',
        phase: 'promotion',
        tips: 'コンセプトシートを入力すると、プリプリ→プリ→ローンチの各フェーズに合わせた投稿を自動生成。配信カレンダーも作成',
        inputsFrom: [
          { appId: 'concept', what: 'コンセプトシートHTML' },
          { appId: 'funnel', what: '各ステップの集客方法' },
          { appId: 'contentgift', what: '特典紹介用の素材' },
          { appId: 'vsl', what: 'VSL案内投稿の素材' },
          { appId: 'seminar', what: 'セミナー告知投稿の素材' },
          { appId: 'movie', what: '動画から生成したSNS投稿素材' },
        ],
        outputsTo: [
          { appId: 'sns', what: '投稿テンプレート・カレンダー' },
          { appId: 'launchreport', what: 'エンゲージメント・クリック数' },
        ],
      },
      {
        id: 'sns',
        name: 'SNS運用',
        description: 'SNSでの集客戦略を策定・実行する',
        port: 3500,
        icon: '📱',
        phase: 'promotion',
        tips: 'オーガニック集客の柱。投稿戦略・フォロワー獲得・エンゲージメント向上の施策を実行',
        inputsFrom: [
          { appId: 'postcreate', what: '投稿テンプレート・カレンダー' },
        ],
        outputsTo: [
          { appId: 'launchreport', what: 'SNSチャンネル別パフォーマンス' },
        ],
      },
      {
        id: 'youtube',
        name: 'YouTube戦略',
        description: 'YouTube集客の企画・構成を作成する',
        port: 3600,
        icon: '▶️',
        phase: 'promotion',
        tips: 'YouTube経由の集客戦略。SEOキーワード・サムネイル・台本構成で再生数→リスト登録を最大化',
        inputsFrom: [
          { appId: 'concept', what: 'ターゲット・メッセージ' },
        ],
        outputsTo: [
          { appId: 'launchreport', what: 'YouTube経由の流入データ' },
        ],
      },
    ],
  },
  {
    id: 'launch',
    title: 'PHASE 5',
    subtitle: 'ローンチ実行・分析',
    color: '#EF4444',
    steps: [
      {
        id: 'finance',
        name: '収支シミュレーション',
        description: 'ローンチの売上・利益をシミュレーションする',
        port: 3100,
        icon: '💰',
        phase: 'launch',
        tips: 'ローンチ前の最終確認。広告費・売上予測・利益率を計算して、目標達成の実現性を検証',
        inputsFrom: [
          { appId: 'funnel', what: 'ファネル数値・CVR目安' },
          { appId: 'marketing', what: '広告費・予算データ' },
        ],
        outputsTo: [
          { appId: 'launchreport', what: '売上・コスト計画値' },
        ],
      },
      {
        id: 'launchreport',
        name: 'ローンチレポート',
        description: 'ローンチ結果の分析レポートを作成する',
        port: 3902,
        icon: '📈',
        phase: 'launch',
        tips: 'ローンチ後の振り返り。各指標の実績vs計画を分析し、次回ローンチの改善点を抽出',
        inputsFrom: [
          { appId: 'finance', what: '売上・コスト計画値' },
          { appId: 'marketing', what: '広告チャンネル別KPI' },
          { appId: 'postcreate', what: 'エンゲージメント・クリック数' },
          { appId: 'salesconsultant', what: '成約データ・商談分析結果' },
          { appId: 'sns', what: 'SNSチャンネル別パフォーマンス' },
        ],
        outputsTo: [],
      },
    ],
  },
];

const ALL_STEPS = PHASES.flatMap(p => p.steps);
const STEP_MAP = Object.fromEntries(ALL_STEPS.map(s => [s.id, s]));

// ─── 状態管理（localStorage） ─────────────────────────────

const STORAGE_KEY = 'launch-hub-progress';

function loadProgress(): Record<string, 'todo' | 'doing' | 'done'> {
  if (typeof window === 'undefined') return {};
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : {};
  } catch { return {}; }
}

function saveProgress(p: Record<string, 'todo' | 'doing' | 'done'>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

// ─── ステータス検知 ─────────────────────────────────────

async function checkPort(port: number): Promise<boolean> {
  try {
    await fetch(`http://localhost:${port}`, { mode: 'no-cors', signal: AbortSignal.timeout(2000) });
    return true;
  } catch { return false; }
}

// ─── コンポーネント ─────────────────────────────────────

function StatusDot({ alive }: { alive: boolean | null }) {
  if (alive === null) return <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D1D5DB', display: 'inline-block' }} />;
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
      background: alive ? '#10B981' : '#9CA3AF',
      boxShadow: alive ? '0 0 6px #10B981' : 'none',
    }} />
  );
}

type StepStatus = 'todo' | 'doing' | 'done';

function ConnectionBadge({ conn, direction, progress }: {
  conn: Connection; direction: 'in' | 'out';
  progress: Record<string, StepStatus>;
}) {
  const target = STEP_MAP[conn.appId];
  if (!target) return null;
  const isDone = progress[conn.appId] === 'done';
  const isDoing = progress[conn.appId] === 'doing';

  return (
    <a
      href={`http://localhost:${target.port}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 6, fontSize: 10, textDecoration: 'none',
        background: direction === 'in'
          ? (isDone ? '#D1FAE5' : isDoing ? '#FEF3C7' : '#FEE2E2')
          : '#EFF6FF',
        color: direction === 'in'
          ? (isDone ? '#059669' : isDoing ? '#D97706' : '#DC2626')
          : '#2563EB',
        border: `1px solid ${direction === 'in'
          ? (isDone ? '#A7F3D0' : isDoing ? '#FDE68A' : '#FECACA')
          : '#BFDBFE'}`,
        transition: 'opacity 0.15s',
        lineHeight: 1.4,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      <span>{target.icon}</span>
      <span style={{ fontWeight: 600 }}>{target.name}</span>
      {direction === 'in' && (
        <span style={{ fontSize: 9, opacity: 0.7 }}>
          {isDone ? '✓' : isDoing ? '…' : '未'}
        </span>
      )}
    </a>
  );
}

function StepCard({ step, index, status, alive, progress, onStatusChange }: {
  step: AppStep; index: number;
  status: StepStatus; alive: boolean | null;
  progress: Record<string, StepStatus>;
  onStatusChange: (s: StepStatus) => void;
}) {
  const phase = PHASES.find(p => p.id === step.phase)!;
  const [showDetail, setShowDetail] = useState(false);
  const statusColors: Record<StepStatus, { bg: string; text: string; label: string }> = {
    todo: { bg: '#F3F4F6', text: '#6B7280', label: '未着手' },
    doing: { bg: '#FEF3C7', text: '#D97706', label: '作業中' },
    done: { bg: '#D1FAE5', text: '#059669', label: '完了' },
  };
  const s = statusColors[status];
  const nextStatus: Record<StepStatus, StepStatus> = { todo: 'doing', doing: 'done', done: 'todo' };

  // Check if dependencies are met
  const unmetDeps = step.inputsFrom.filter(c => progress[c.appId] !== 'done');
  const allDepsMet = step.inputsFrom.length === 0 || unmetDeps.length === 0;

  return (
    <div style={{
      background: '#FFFFFF', borderRadius: 16, overflow: 'hidden',
      border: status === 'doing' ? `2px solid ${phase.color}` : '1px solid #E5E7EB',
      boxShadow: status === 'doing' ? `0 0 0 3px ${phase.color}20` : '0 1px 3px rgba(0,0,0,0.06)',
      transition: 'all 0.2s',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 28 }}>{step.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{step.name}</span>
            <StatusDot alive={alive} />
            <span style={{ fontSize: 10, color: alive ? '#10B981' : '#9CA3AF' }}>
              {alive === null ? '' : alive ? '起動中' : '停止中'}
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>{step.description}</p>
        </div>

        {/* Status badge */}
        <button
          onClick={() => onStatusChange(nextStatus[status])}
          style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: s.bg, color: s.text, border: 'none', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {s.label}
        </button>
      </div>

      {/* Dependency warning */}
      {!allDepsMet && status === 'todo' && (
        <div style={{
          margin: '0 20px', padding: '6px 10px', borderRadius: 6, fontSize: 11,
          background: '#FEF3C7', color: '#92400E',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          ⚠ 先に完了が必要: {unmetDeps.map(d => STEP_MAP[d.appId]?.name).join('、')}
        </div>
      )}

      {/* Connection summary (always visible) */}
      {(step.inputsFrom.length > 0 || step.outputsTo.length > 0) && (
        <div style={{ padding: '8px 20px 4px' }}>
          <button
            onClick={() => setShowDetail(!showDetail)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: '#9CA3AF', padding: '2px 0',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            {showDetail ? '▼' : '▶'} 連携アプリ
            {step.inputsFrom.length > 0 && (
              <span style={{
                padding: '1px 6px', borderRadius: 8, fontSize: 9, fontWeight: 600,
                background: allDepsMet ? '#D1FAE5' : '#FEE2E2',
                color: allDepsMet ? '#059669' : '#DC2626',
              }}>
                入力 {step.inputsFrom.filter(c => progress[c.appId] === 'done').length}/{step.inputsFrom.length}
              </span>
            )}
            {step.outputsTo.length > 0 && (
              <span style={{
                padding: '1px 6px', borderRadius: 8, fontSize: 9, fontWeight: 600,
                background: '#EFF6FF', color: '#2563EB',
              }}>
                出力先 {step.outputsTo.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Connection detail (collapsible) */}
      {showDetail && (
        <div style={{ padding: '4px 20px 8px' }}>
          {step.inputsFrom.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', marginBottom: 4 }}>
                📥 ここに入力が必要な情報
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {step.inputsFrom.map(conn => (
                  <div key={conn.appId} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ConnectionBadge conn={conn} direction="in" progress={progress} />
                    <span style={{ fontSize: 10, color: '#9CA3AF' }}>→ {conn.what}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step.outputsTo.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', marginBottom: 4 }}>
                📤 このアプリの成果物を使う先
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {step.outputsTo.map(conn => (
                  <div key={conn.appId} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ConnectionBadge conn={conn} direction="out" progress={progress} />
                    <span style={{ fontSize: 10, color: '#9CA3AF' }}>← {conn.what}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <p style={{
            fontSize: 11, color: '#6B7280', lineHeight: 1.8, marginTop: 8,
            padding: '8px 12px', borderRadius: 8, margin: '8px 0 0',
            background: '#F9FAFB', borderLeft: `3px solid ${phase.color}`,
          }}>
            💡 {step.tips}
          </p>
        </div>
      )}

      {/* Action */}
      <div style={{ padding: '8px 20px 16px', display: 'flex', gap: 8 }}>
        <a
          href={`http://localhost:${step.port}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: phase.color, color: '#FFF', textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          アプリを開く →
        </a>
        <span style={{ fontSize: 11, color: '#9CA3AF', alignSelf: 'center' }}>
          localhost:{step.port}
        </span>
      </div>
    </div>
  );
}

// ─── メインページ ─────────────────────────────────────

export default function LaunchHub() {
  const [progress, setProgress] = useState<Record<string, StepStatus>>({});
  const [aliveMap, setAliveMap] = useState<Record<string, boolean | null>>({});
  const [projectName, setProjectName] = useState('');
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    const saved = localStorage.getItem('launch-hub-project-name');
    if (saved) setProjectName(saved);

    ALL_STEPS.forEach(step => {
      checkPort(step.port).then(alive => {
        setAliveMap(prev => ({ ...prev, [step.id]: alive }));
      });
    });
  }, []);

  function updateStatus(id: string, status: StepStatus) {
    const next = { ...progress, [id]: status };
    setProgress(next);
    saveProgress(next);
  }

  function saveName(name: string) {
    setProjectName(name);
    localStorage.setItem('launch-hub-project-name', name);
    setEditingName(false);
  }

  const total = ALL_STEPS.length;
  const doneCount = ALL_STEPS.filter(s => progress[s.id] === 'done').length;
  const doingCount = ALL_STEPS.filter(s => progress[s.id] === 'doing').length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const currentStep = ALL_STEPS.find(s => progress[s.id] === 'doing')
    || ALL_STEPS.find(s => progress[s.id] !== 'done');

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      {/* ─── Hero ─── */}
      <header style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
        padding: '40px 24px 32px', color: '#FFF',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Launch Hub
              </h1>
              <p style={{ fontSize: 13, color: '#A5B4FC', margin: '4px 0 0' }}>
                ローンチに必要な全ツールを一元管理
              </p>
            </div>
            <div>
              {editingName ? (
                <input
                  autoFocus
                  defaultValue={projectName}
                  placeholder="プロジェクト名を入力..."
                  onBlur={e => saveName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName((e.target as HTMLInputElement).value)}
                  style={{
                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 8, padding: '6px 12px', color: '#FFF', fontSize: 14,
                    outline: 'none', width: 240,
                  }}
                />
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 8, padding: '6px 16px', color: '#E0E7FF', fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {projectName || '📝 プロジェクト名を設定'}
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#C7D2FE' }}>
                全体進捗 — {doneCount}/{total} 完了 {doingCount > 0 && `・${doingCount} 作業中`}
              </span>
              <span style={{ fontSize: 20, fontWeight: 800 }}>{pct}%</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, transition: 'width 0.5s ease',
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #34D399, #10B981)',
              }} />
            </div>
          </div>

          {/* Current step indicator */}
          {currentStep && (
            <div style={{
              background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 12, backdropFilter: 'blur(8px)',
            }}>
              <span style={{ fontSize: 24 }}>{currentStep.icon}</span>
              <div>
                <span style={{ fontSize: 11, color: '#A5B4FC' }}>
                  {progress[currentStep.id] === 'doing' ? '現在の作業' : '次のステップ'}
                </span>
                <p style={{ fontSize: 14, fontWeight: 700, margin: '2px 0 0' }}>{currentStep.name}</p>
              </div>
              <a
                href={`http://localhost:${currentStep.port}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginLeft: 'auto', padding: '8px 20px', borderRadius: 8,
                  background: '#FFF', color: '#312E81', fontSize: 13, fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                開く →
              </a>
            </div>
          )}
        </div>
      </header>

      {/* ─── Phases ─── */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 80px' }}>
        {PHASES.map((phase, pi) => {
          const phaseDone = phase.steps.filter(s => progress[s.id] === 'done').length;
          const phaseTotal = phase.steps.length;
          const phasePct = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;

          return (
            <div key={phase.id} style={{ marginBottom: 48 }}>
              {/* Phase header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  background: phase.color, color: '#FFF', padding: '4px 12px',
                  borderRadius: 6, fontSize: 11, fontWeight: 800, letterSpacing: '0.05em',
                }}>
                  {phase.title}
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{phase.subtitle}</span>
                <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 'auto' }}>
                  {phaseDone}/{phaseTotal} 完了
                </span>
                <div style={{ width: 80, height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: phase.color, width: `${phasePct}%`, borderRadius: 2, transition: 'width 0.3s' }} />
                </div>
              </div>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {phase.steps.map((step, si) => (
                  <div key={step.id} style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
                    {/* Connector line */}
                    <div style={{ width: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                        background: progress[step.id] === 'done' ? '#10B981' : progress[step.id] === 'doing' ? phase.color : '#E5E7EB',
                        color: progress[step.id] !== 'todo' ? '#FFF' : '#9CA3AF',
                        flexShrink: 0, marginTop: 18,
                      }}>
                        {progress[step.id] === 'done' ? '✓' : si + 1}
                      </div>
                      {si < phase.steps.length - 1 && (
                        <div style={{ width: 2, flex: 1, background: progress[step.id] === 'done' ? '#10B981' : '#E5E7EB' }} />
                      )}
                    </div>
                    {/* Card */}
                    <div style={{ flex: 1 }}>
                      <StepCard
                        step={step}
                        index={si}
                        status={progress[step.id] || 'todo'}
                        alive={aliveMap[step.id] ?? null}
                        progress={progress}
                        onStatusChange={s => updateStatus(step.id, s)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Arrow to next phase */}
              {pi < PHASES.length - 1 && (
                <div style={{ textAlign: 'center', padding: '16px 0 0', color: '#D1D5DB', fontSize: 20 }}>
                  ↓
                </div>
              )}
            </div>
          );
        })}

        {/* Reset button */}
        <div style={{ textAlign: 'center', paddingTop: 24, borderTop: '1px solid #E5E7EB' }}>
          <button
            onClick={() => {
              if (confirm('進捗をすべてリセットしますか？')) {
                setProgress({});
                localStorage.removeItem(STORAGE_KEY);
              }
            }}
            style={{
              background: 'none', border: '1px solid #E5E7EB', borderRadius: 8,
              padding: '8px 20px', fontSize: 12, color: '#9CA3AF', cursor: 'pointer',
            }}
          >
            進捗をリセット
          </button>
        </div>
      </main>
    </div>
  );
}
