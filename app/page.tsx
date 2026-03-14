'use client';

import { useState, useEffect } from 'react';

// ─── タブ定義 ─────────────────────────────────────
type TabId = 'dashboard' | 'schedule' | 'kpi';

// ─── プロジェクト管理 ─────────────────────────────────

interface Project {
  id: string;
  name: string;
  createdAt: string;
}

const PROJECTS_KEY = 'launch-hub-projects';
const ACTIVE_PROJECT_KEY = 'launch-hub-active-project';

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function loadProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]'); } catch { return []; }
}
function saveProjects(p: Project[]) { localStorage.setItem(PROJECTS_KEY, JSON.stringify(p)); }

function projectKey(projectId: string, suffix: string) { return `lh-${projectId}-${suffix}`; }

function loadProjectData<T>(projectId: string, suffix: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const d = localStorage.getItem(projectKey(projectId, suffix));
    return d ? JSON.parse(d) : fallback;
  } catch { return fallback; }
}
function saveProjectData<T>(projectId: string, suffix: string, data: T) {
  localStorage.setItem(projectKey(projectId, suffix), JSON.stringify(data));
}

// ─── ローンチフロー定義 ─────────────────────────────────

interface Connection {
  appId: string;
  what: string;
}

interface AppStep {
  id: string;
  name: string;
  description: string;
  port: number;
  icon: string;
  phase: string;
  tips: string;
  inputsFrom: Connection[];
  outputsTo: Connection[];
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
    id: 'strategy', title: 'PHASE 1', subtitle: '戦略設計', color: '#6366F1',
    steps: [
      {
        id: 'movie', name: '動画分析（リサーチ）',
        description: '競合や参考動画を分析し、ローンチ設計のリサーチに活用する',
        port: 3200, icon: '🔍', phase: 'strategy',
        tips: '競合のプロモーション動画やセールス動画を分析。構成・訴求ポイント・CTAを研究して自分のローンチに活かす',
        inputsFrom: [],
        outputsTo: [
          { appId: 'concept', what: '競合分析・市場調査の結果' },
          { appId: 'postcreate', what: '動画から生成したSNS投稿素材' },
        ],
      },
      {
        id: 'concept', name: 'コンセプト設計',
        description: '商品コンセプト・ポジショニング・ターゲット設定を行う',
        port: 3900, icon: '🎯', phase: 'strategy',
        tips: '全ての土台。USP・ターゲット・ポジショニングを固める。ここが曖昧だと後の全工程がブレる',
        inputsFrom: [],
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
        id: 'funnel', name: 'ファネル設計',
        description: 'ローンチ全体のファネル構造を設計する',
        port: 3800, icon: '🏗️', phase: 'strategy',
        tips: 'コンセプトが決まったら、集客→教育→販売の流れを設計。各ステップの役割・CVR目安・導線を明確にする',
        inputsFrom: [{ appId: 'concept', what: 'コンセプト・セールスポイント' }],
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
    id: 'content', title: 'PHASE 2', subtitle: 'コンテンツ制作', color: '#EC4899',
    steps: [
      {
        id: 'contentgift', name: 'リードマグネット',
        description: 'リスト獲得用の無料特典コンテンツを作成する',
        port: 3906, icon: '🎁', phase: 'content',
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
        id: 'vsl', name: 'VSL（動画セールスレター）',
        description: 'セールス動画の台本・構成を作成する',
        port: 3300, icon: '🎬', phase: 'content',
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
        id: 'seminar', name: 'セミナー設計',
        description: 'ウェビナー・セミナーの構成を14BLOCKで設計する',
        port: 3904, icon: '🎤', phase: 'content',
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
        id: 'salesconsultant', name: '個別相談設計',
        description: '個別相談・セールスの台本を9フェーズで作成する',
        port: 3905, icon: '🤝', phase: 'content',
        tips: 'セミナー後や直接申込の個別相談フロー。ヒアリング→提案→反論処理→クロージングの台本を作る',
        inputsFrom: [
          { appId: 'concept', what: 'ペルソナ・セールスポイント' },
          { appId: 'seminar', what: 'セミナー内容（参加者の状態）' },
        ],
        outputsTo: [{ appId: 'launchreport', what: '成約データ・商談分析結果' }],
      },
    ],
  },
  {
    id: 'asset', title: 'PHASE 3', subtitle: 'アセット制作', color: '#F59E0B',
    steps: [
      {
        id: 'lp', name: 'LP制作',
        description: 'オプトイン・セミナー申込・セールスの各LPを構築する',
        port: 3903, icon: '📄', phase: 'asset',
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
    id: 'promotion', title: 'PHASE 4', subtitle: '集客・プロモーション', color: '#10B981',
    steps: [
      {
        id: 'marketing', name: 'マーケティング',
        description: '広告・マーケティング戦略を立案する',
        port: 3400, icon: '📊', phase: 'promotion',
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
        id: 'postcreate', name: '投稿作成',
        description: 'SNS投稿・メール/LINE配信文を作成する',
        port: 3901, icon: '✏️', phase: 'promotion',
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
        id: 'sns', name: 'SNS運用',
        description: 'SNSでの集客戦略を策定・実行する',
        port: 3500, icon: '📱', phase: 'promotion',
        tips: 'オーガニック集客の柱。投稿戦略・フォロワー獲得・エンゲージメント向上の施策を実行',
        inputsFrom: [{ appId: 'postcreate', what: '投稿テンプレート・カレンダー' }],
        outputsTo: [{ appId: 'launchreport', what: 'SNSチャンネル別パフォーマンス' }],
      },
      {
        id: 'youtube', name: 'YouTube戦略',
        description: 'YouTube集客の企画・構成を作成する',
        port: 3600, icon: '▶️', phase: 'promotion',
        tips: 'YouTube経由の集客戦略。SEOキーワード・サムネイル・台本構成で再生数→リスト登録を最大化',
        inputsFrom: [{ appId: 'concept', what: 'ターゲット・メッセージ' }],
        outputsTo: [{ appId: 'launchreport', what: 'YouTube経由の流入データ' }],
      },
    ],
  },
  {
    id: 'launch', title: 'PHASE 5', subtitle: 'ローンチ実行・分析', color: '#EF4444',
    steps: [
      {
        id: 'finance', name: '収支シミュレーション',
        description: 'ローンチの売上・利益をシミュレーションする',
        port: 3100, icon: '💰', phase: 'launch',
        tips: 'ローンチ前の最終確認。広告費・売上予測・利益率を計算して、目標達成の実現性を検証',
        inputsFrom: [
          { appId: 'funnel', what: 'ファネル数値・CVR目安' },
          { appId: 'marketing', what: '広告費・予算データ' },
        ],
        outputsTo: [{ appId: 'launchreport', what: '売上・コスト計画値' }],
      },
      {
        id: 'launchreport', name: 'ローンチレポート',
        description: 'ローンチ結果の分析レポートを作成する',
        port: 3902, icon: '📈', phase: 'launch',
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

// ─── ローンチスケジュール定義（アプリベースタスク） ────────────

interface ScheduleTask {
  id: string;
  appId: string | null; // null = 手動タスク
  label: string;
}

interface SchedulePhase {
  id: string;
  week: string;
  title: string;
  color: string;
  deliverables: string[];
  kpiTargets: string[];
  tasks: ScheduleTask[];
  freezeDeadline?: string;
}

const SCHEDULE_PHASES: SchedulePhase[] = [
  {
    id: 'sp1', week: 'T-8〜T-7', title: '設計', color: '#6366F1',
    deliverables: ['コンセプトシート', 'ファネル設計図', '価格・特典確定'],
    kpiTargets: ['告知既読率 20%+', '事前アンケート 50件+'],
    tasks: [
      { id: 'sp1-1', appId: 'concept', label: 'ターゲット・ペルソナ・USPを定義する' },
      { id: 'sp1-2', appId: 'concept', label: 'メインコピー・価値提案を言語化する' },
      { id: 'sp1-3', appId: 'concept', label: '価格・特典・保証を設定する' },
      { id: 'sp1-4', appId: 'concept', label: 'コンセプトシートを出力する' },
      { id: 'sp1-5', appId: 'funnel', label: '集客→教育→販売のファネル構造を設計する' },
      { id: 'sp1-6', appId: 'funnel', label: '各ステップのCVR目安・導線を設定する' },
      { id: 'sp1-7', appId: 'movie', label: '競合の動画・プロモーションをリサーチする（任意）' },
    ],
  },
  {
    id: 'sp2', week: 'T-7〜T-6', title: '基盤整備', color: '#8B5CF6',
    deliverables: ['特典コンテンツ', 'VSL台本', 'セミナー構成', 'LP初稿'],
    kpiTargets: ['LP仮登録率 20%+'],
    tasks: [
      { id: 'sp2-1', appId: 'contentgift', label: '特典の種類を選ぶ（チェックリスト/ガイド/動画台本等）' },
      { id: 'sp2-2', appId: 'contentgift', label: '特典コンテンツを生成・品質検証する' },
      { id: 'sp2-3', appId: 'vsl', label: 'VSL台本をストーリー構成で作成する' },
      { id: 'sp2-4', appId: 'seminar', label: '14BLOCK構成でセミナースライド・トークスクリプトを作成する' },
      { id: 'sp2-5', appId: 'salesconsultant', label: '個別相談の9フェーズ台本を作成する' },
      { id: 'sp2-6', appId: 'lp', label: 'オプトインLPを作成する' },
      { id: 'sp2-7', appId: 'lp', label: 'セミナー申込LPを作成する' },
    ],
    freezeDeadline: 'T-6週: オファー確定',
  },
  {
    id: 'sp3', week: 'T-6〜T-4', title: 'ティザー', color: '#EC4899',
    deliverables: ['ティザー投稿群', '事例投稿群', '配信カレンダー'],
    kpiTargets: ['ストーリーリンクCTR 1.5〜3%', '週間登録数 100件'],
    tasks: [
      { id: 'sp3-1', appId: 'postcreate', label: 'ティザー投稿を作成する（Instagram/X/LINE等）' },
      { id: 'sp3-2', appId: 'postcreate', label: '事例・実績投稿を作成する' },
      { id: 'sp3-3', appId: 'postcreate', label: '投稿カレンダーを作成・管理する' },
      { id: 'sp3-4', appId: 'sns', label: 'SNS投稿スケジュールを実行する' },
      { id: 'sp3-5', appId: 'marketing', label: 'コラボ候補リストを作成・打診する' },
      { id: 'sp3-6', appId: null, label: 'UGC募集キャンペーンを開始する' },
    ],
    freezeDeadline: 'T-4週: LP確定',
  },
  {
    id: 'sp4', week: 'T-4〜T-3', title: 'コラボ・UGC', color: '#F59E0B',
    deliverables: ['コラボLiveアーカイブ', 'ゲスト回コンテンツ', 'UGC素材'],
    kpiTargets: ['コラボLive同時接続 100人', 'アーカイブ 500回再生', '外部経由登録 30%+'],
    tasks: [
      { id: 'sp4-1', appId: 'sns', label: 'コラボLiveを企画・実施する（週2回）' },
      { id: 'sp4-2', appId: 'youtube', label: 'ゲスト回の企画・台本を作成する' },
      { id: 'sp4-3', appId: 'postcreate', label: 'コラボ告知・UGC紹介投稿を作成する' },
      { id: 'sp4-4', appId: null, label: 'UGCコンテンツを5件以上集める' },
    ],
  },
  {
    id: 'sp5', week: 'T-3〜T-2', title: '教育先出し', color: '#10B981',
    deliverables: ['ミニ講座動画', '反論回答集', 'オリエンLive'],
    kpiTargets: ['オリエン参加率 35〜45%', 'Q&A投稿 30件+'],
    tasks: [
      { id: 'sp5-1', appId: 'vsl', label: 'ミニ講座動画の台本を作成する（3本）' },
      { id: 'sp5-2', appId: 'contentgift', label: '反論回答集コンテンツを作成する' },
      { id: 'sp5-3', appId: 'seminar', label: 'オリエンテーションLiveの構成を作成する' },
      { id: 'sp5-4', appId: 'postcreate', label: 'オリエン告知・教育コンテンツ投稿を作成する' },
    ],
    freezeDeadline: 'T-2週: 配信シナリオ確定',
  },
  {
    id: 'sp6', week: 'T-2〜T-1', title: '最終集客', color: '#EF4444',
    deliverables: ['カウントダウン投稿', '紹介キャンペーン', 'リマインド設定'],
    kpiTargets: ['初日参加見込み 40〜50%', '紹介経由 10%'],
    tasks: [
      { id: 'sp6-1', appId: 'postcreate', label: 'カウントダウン投稿を作成する（毎日分）' },
      { id: 'sp6-2', appId: 'postcreate', label: '紹介キャンペーン用の投稿・配信文を作成する' },
      { id: 'sp6-3', appId: 'postcreate', label: 'リマインドメール/LINE配信文を作成する' },
      { id: 'sp6-4', appId: 'lp', label: 'セールスLPを完成させる' },
      { id: 'sp6-5', appId: null, label: 'LP→セミナー→申込の通しテストを行う' },
      { id: 'sp6-6', appId: null, label: 'セミナー・配信のリハーサルを実施する' },
    ],
    freezeDeadline: 'T-3日: 当日オペレーション確定',
  },
  {
    id: 'sp7', week: 'T週', title: '本番', color: '#DC2626',
    deliverables: ['Day1/Day2配信', 'ハイライト配信', '個別相談受付'],
    kpiTargets: ['初日参加率 40〜50%', '個別相談申込率 10〜20%'],
    tasks: [
      { id: 'sp7-1', appId: 'seminar', label: 'Day1の配信スライド・スクリプトを最終確認する' },
      { id: 'sp7-2', appId: 'seminar', label: 'Day2の配信スライド・スクリプトを最終確認する' },
      { id: 'sp7-3', appId: 'postcreate', label: 'リマインド・ハイライト配信文を送信する' },
      { id: 'sp7-4', appId: 'salesconsultant', label: '個別相談フォーム・予約導線を設置する' },
      { id: 'sp7-5', appId: null, label: 'Day1を配信する' },
      { id: 'sp7-6', appId: null, label: 'Day2を配信する' },
    ],
  },
  {
    id: 'sp8', week: 'T+1〜T+10', title: '販売', color: '#B91C1C',
    deliverables: ['セールス配信', '個別相談実施', '成約記録'],
    kpiTargets: ['成約率(チャレンジ) 10〜20%', '成約率(セミナー) 7〜15%'],
    tasks: [
      { id: 'sp8-1', appId: 'postcreate', label: 'セールス配信文を作成する（2回分）' },
      { id: 'sp8-2', appId: 'postcreate', label: '締切前カウントダウン配信文を作成する' },
      { id: 'sp8-3', appId: 'salesconsultant', label: '個別相談を実施・台本に沿ってクロージングする' },
      { id: 'sp8-4', appId: 'finance', label: '売上・成約データを記録する' },
    ],
  },
  {
    id: 'sp9', week: 'T+11〜T+21', title: '振り返り', color: '#6B7280',
    deliverables: ['ローンチレポート', '改善案', '投資対効果'],
    kpiTargets: ['投資対効果 = 売上 ÷ (人件費+ツール費)'],
    tasks: [
      { id: 'sp9-1', appId: 'launchreport', label: 'ファネル分析・チャンネル別KPIレポートを生成する' },
      { id: 'sp9-2', appId: 'launchreport', label: '成功要因・改善策・次回戦略を分析する' },
      { id: 'sp9-3', appId: 'finance', label: '投資対効果（売上÷コスト）を算出する' },
    ],
  },
];

// ─── KPI定義 ─────────────────────────────────────

interface KpiBenchmark {
  id: string;
  name: string;
  category: 'upstream' | 'midstream' | 'downstream';
  good: string;
  caution: string;
  needsWork: string;
  unit: string;
}

const KPI_BENCHMARKS: KpiBenchmark[] = [
  { id: 'k1', name: 'LP登録率', category: 'upstream', good: '25%以上', caution: '15〜25%', needsWork: '15%未満', unit: '%' },
  { id: 'k2', name: 'リンククリック率', category: 'upstream', good: '15%以上', caution: '8〜15%', needsWork: '8%未満', unit: '%' },
  { id: 'k3', name: 'ストーリーCTR', category: 'upstream', good: '3%以上', caution: '1.5〜3%', needsWork: '1.5%未満', unit: '%' },
  { id: 'k4', name: '週間新規リスト数', category: 'upstream', good: '100件以上', caution: '50〜100件', needsWork: '50件未満', unit: '件' },
  { id: 'k5', name: 'オリエン参加率', category: 'midstream', good: '45%以上', caution: '35〜45%', needsWork: '35%未満', unit: '%' },
  { id: 'k6', name: 'Day1参加率', category: 'midstream', good: '50%以上', caution: '35〜50%', needsWork: '35%未満', unit: '%' },
  { id: 'k7', name: 'Q&A投稿数', category: 'midstream', good: '30件以上', caution: '15〜30件', needsWork: '15件未満', unit: '件' },
  { id: 'k8', name: '個別相談申込率', category: 'downstream', good: '20%以上', caution: '10〜20%', needsWork: '10%未満', unit: '%' },
  { id: 'k9', name: '成約率(チャレンジ)', category: 'downstream', good: '20%以上', caution: '10〜20%', needsWork: '10%未満', unit: '%' },
  { id: 'k10', name: '成約率(セミナー)', category: 'downstream', good: '15%以上', caution: '7〜15%', needsWork: '7%未満', unit: '%' },
];

const KPI_REVERSE_STEPS = [
  { step: 1, label: '目標売上', description: 'まず目標売上金額を決める', example: '300万円' },
  { step: 2, label: '必要購入数', description: '目標売上 ÷ 単価 = 必要な購入者数', example: '300万÷30万=10人' },
  { step: 3, label: '必要参加者数', description: '購入数 ÷ 成約率 = セミナー/チャレンジ参加者数', example: '10人÷15%=67人' },
  { step: 4, label: '必要登録者数', description: '参加者数 ÷ 参加率 = LP登録者数', example: '67人÷45%=149人' },
  { step: 5, label: '必要LPアクセス数', description: '登録者数 ÷ LP登録率 = LPアクセス数', example: '149人÷25%=596人' },
  { step: 6, label: 'ギャップ確認', description: '現在のリスト数・流入と比較して不足分を特定', example: 'リスト500人→追加96人必要' },
];

// ─── 緊急プロトコル・上乗せ施策 ────────────────────────

const EMERGENCY_PROTOCOLS = [
  {
    id: 'ep1', trigger: '申込不振', condition: 'LP登録率15%未満 or 週間登録50件未満', color: '#DC2626',
    actions: ['LPヘッドラインのA/Bテストを即日実施', '特典追加（期間限定ボーナス）', 'リマーケティング広告を強化', 'コラボLiveを緊急追加（週+1回）', 'DMフォロー対象を拡大'],
  },
  {
    id: 'ep2', trigger: 'リスト反応鈍化', condition: 'メール開封率15%未満 or クリック率3%未満', color: '#F59E0B',
    actions: ['件名をパーソナライズ（名前挿入）', '配信時間帯を変更してテスト', 'テキストメールに切り替え', 'LINE配信の頻度・内容を見直す', '価値先出しコンテンツを追加配信'],
  },
  {
    id: 'ep3', trigger: '中盤鈍化', condition: 'Day1→Day2脱落率50%超 or Q&A投稿15件未満', color: '#8B5CF6',
    actions: ['Day1ハイライトを即配信（見逃し対策）', 'Day2参加特典を追加告知', '個別メッセージで再アプローチ', 'コミュニティでQ&A促進イベント', '成功事例ストーリーを追加投稿'],
  },
];

const BOOST_TACTICS = [
  { label: 'フラッシュセール', description: '48時間限定の早期割引', timing: 'T-1週' },
  { label: 'バンドルオファー', description: '2名同時申込で割引', timing: 'T週' },
  { label: '紹介インセンティブ', description: '紹介者にボーナス特典', timing: 'T-2〜T週' },
  { label: 'ライブQ&A追加', description: '質問対応の緊急Live', timing: '随時' },
  { label: 'リタゲ広告強化', description: 'LP訪問者への再アプローチ', timing: 'T-3〜T+7' },
];

// ─── 日付ヘルパー ─────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const r = new Date(date); r.setDate(r.getDate() + days); return r;
}
function formatDate(d: Date) { return `${d.getMonth() + 1}/${d.getDate()}`; }

function getPhaseDate(launchDate: Date, week: string): string {
  const m = week.match(/T([+-]?\d+)?/);
  if (!m) return '';
  const off = m[1] ? parseInt(m[1]) : 0;
  const start = addDays(launchDate, off * 7);
  const m2 = week.match(/T([+-]?\d+)$/);
  if (m2) return `${formatDate(start)} 〜 ${formatDate(addDays(launchDate, parseInt(m2[1]) * 7))}`;
  if (week === 'T週') return `${formatDate(launchDate)} 〜 ${formatDate(addDays(launchDate, 6))}`;
  return formatDate(start);
}

function parsePhaseDates(launchDate: Date, week: string) {
  const parts = week.split('〜');
  const parseT = (s: string) => { const m = s.trim().match(/T([+-]?\d+)?/); return m?.[1] ? parseInt(m[1]) : 0; };
  const sw = parseT(parts[0]), ew = parts[1] ? parseT(parts[1]) : sw;
  return { start: addDays(launchDate, sw * 7), end: addDays(launchDate, ew * 7 + 6) };
}

// ─── ポート検知 ─────────────────────────────────────

async function checkPort(port: number): Promise<boolean> {
  try { await fetch(`http://localhost:${port}`, { mode: 'no-cors', signal: AbortSignal.timeout(2000) }); return true; }
  catch { return false; }
}

// ─── ダッシュボード用コンポーネント ──────────────────────

type StepStatus = 'todo' | 'doing' | 'done';

function StatusDot({ alive }: { alive: boolean | null }) {
  if (alive === null) return <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D1D5DB', display: 'inline-block' }} />;
  return <span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: alive ? '#10B981' : '#9CA3AF', boxShadow: alive ? '0 0 6px #10B981' : 'none' }} />;
}

function ConnectionBadge({ conn, direction, progress }: { conn: Connection; direction: 'in' | 'out'; progress: Record<string, StepStatus> }) {
  const target = STEP_MAP[conn.appId];
  if (!target) return null;
  const isDone = progress[conn.appId] === 'done';
  const isDoing = progress[conn.appId] === 'doing';
  return (
    <a href={`http://localhost:${target.port}`} target="_blank" rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 10, textDecoration: 'none',
        background: direction === 'in' ? (isDone ? '#D1FAE5' : isDoing ? '#FEF3C7' : '#FEE2E2') : '#EFF6FF',
        color: direction === 'in' ? (isDone ? '#059669' : isDoing ? '#D97706' : '#DC2626') : '#2563EB',
        border: `1px solid ${direction === 'in' ? (isDone ? '#A7F3D0' : isDoing ? '#FDE68A' : '#FECACA') : '#BFDBFE'}`,
        transition: 'opacity 0.15s', lineHeight: 1.4,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      <span>{target.icon}</span>
      <span style={{ fontWeight: 600 }}>{target.name}</span>
      {direction === 'in' && <span style={{ fontSize: 9, opacity: 0.7 }}>{isDone ? '✓' : isDoing ? '…' : '未'}</span>}
    </a>
  );
}

function StepCard({ step, index, status, alive, progress, onStatusChange }: {
  step: AppStep; index: number; status: StepStatus; alive: boolean | null;
  progress: Record<string, StepStatus>; onStatusChange: (s: StepStatus) => void;
}) {
  const phase = PHASES.find(p => p.id === step.phase)!;
  const [showDetail, setShowDetail] = useState(false);
  const sc: Record<StepStatus, { bg: string; text: string; label: string }> = {
    todo: { bg: '#F3F4F6', text: '#6B7280', label: '未着手' },
    doing: { bg: '#FEF3C7', text: '#D97706', label: '作業中' },
    done: { bg: '#D1FAE5', text: '#059669', label: '完了' },
  };
  const s = sc[status];
  const ns: Record<StepStatus, StepStatus> = { todo: 'doing', doing: 'done', done: 'todo' };
  const unmetDeps = step.inputsFrom.filter(c => progress[c.appId] !== 'done');
  const allDepsMet = step.inputsFrom.length === 0 || unmetDeps.length === 0;

  return (
    <div style={{
      background: '#FFF', borderRadius: 16, overflow: 'hidden',
      border: status === 'doing' ? `2px solid ${phase.color}` : '1px solid #E5E7EB',
      boxShadow: status === 'doing' ? `0 0 0 3px ${phase.color}20` : '0 1px 3px rgba(0,0,0,0.06)',
      transition: 'all 0.2s',
    }}>
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 28 }}>{step.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{step.name}</span>
            <StatusDot alive={alive} />
            <span style={{ fontSize: 10, color: alive ? '#10B981' : '#9CA3AF' }}>{alive === null ? '' : alive ? '起動中' : '停止中'}</span>
          </div>
          <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>{step.description}</p>
        </div>
        <button onClick={() => onStatusChange(ns[status])} style={{
          padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
          background: s.bg, color: s.text, border: 'none', cursor: 'pointer',
        }}>{s.label}</button>
      </div>
      {!allDepsMet && status === 'todo' && (
        <div style={{ margin: '0 20px', padding: '6px 10px', borderRadius: 6, fontSize: 11, background: '#FEF3C7', color: '#92400E', display: 'flex', alignItems: 'center', gap: 4 }}>
          ⚠ 先に完了が必要: {unmetDeps.map(d => STEP_MAP[d.appId]?.name).join('、')}
        </div>
      )}
      {(step.inputsFrom.length > 0 || step.outputsTo.length > 0) && (
        <div style={{ padding: '8px 20px 4px' }}>
          <button onClick={() => setShowDetail(!showDetail)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#9CA3AF', padding: '2px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
            {showDetail ? '▼' : '▶'} 連携アプリ
            {step.inputsFrom.length > 0 && <span style={{ padding: '1px 6px', borderRadius: 8, fontSize: 9, fontWeight: 600, background: allDepsMet ? '#D1FAE5' : '#FEE2E2', color: allDepsMet ? '#059669' : '#DC2626' }}>入力 {step.inputsFrom.filter(c => progress[c.appId] === 'done').length}/{step.inputsFrom.length}</span>}
            {step.outputsTo.length > 0 && <span style={{ padding: '1px 6px', borderRadius: 8, fontSize: 9, fontWeight: 600, background: '#EFF6FF', color: '#2563EB' }}>出力先 {step.outputsTo.length}</span>}
          </button>
        </div>
      )}
      {showDetail && (
        <div style={{ padding: '4px 20px 8px' }}>
          {step.inputsFrom.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', marginBottom: 4 }}>📥 ここに入力が必要な情報</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {step.inputsFrom.map(c => <div key={c.appId} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ConnectionBadge conn={c} direction="in" progress={progress} /><span style={{ fontSize: 10, color: '#9CA3AF' }}>→ {c.what}</span></div>)}
              </div>
            </div>
          )}
          {step.outputsTo.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', marginBottom: 4 }}>📤 このアプリの成果物を使う先</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {step.outputsTo.map(c => <div key={c.appId} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ConnectionBadge conn={c} direction="out" progress={progress} /><span style={{ fontSize: 10, color: '#9CA3AF' }}>← {c.what}</span></div>)}
              </div>
            </div>
          )}
          <p style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.8, marginTop: 8, padding: '8px 12px', borderRadius: 8, margin: '8px 0 0', background: '#F9FAFB', borderLeft: `3px solid ${phase.color}` }}>💡 {step.tips}</p>
        </div>
      )}
      <div style={{ padding: '8px 20px 16px', display: 'flex', gap: 8 }}>
        <a href={`http://localhost:${step.port}`} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: phase.color, color: '#FFF', textDecoration: 'none', transition: 'opacity 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >アプリを開く →</a>
        <span style={{ fontSize: 11, color: '#9CA3AF', alignSelf: 'center' }}>localhost:{step.port}</span>
      </div>
    </div>
  );
}

// ─── スケジュールタブ ─────────────────────────────────

function ScheduleTab({ projectId, launchDate, setLaunchDate, taskChecks, setTaskChecks }: {
  projectId: string; launchDate: string; setLaunchDate: (d: string) => void;
  taskChecks: Record<string, boolean>; setTaskChecks: (t: Record<string, boolean>) => void;
}) {
  const launchDateObj = launchDate ? new Date(launchDate) : null;

  function toggleTask(id: string) {
    const next = { ...taskChecks, [id]: !taskChecks[id] };
    setTaskChecks(next);
    saveProjectData(projectId, 'tasks', next);
  }

  const totalTasks = SCHEDULE_PHASES.flatMap(p => p.tasks).length;
  const doneTasks = SCHEDULE_PHASES.flatMap(p => p.tasks).filter(t => taskChecks[t.id]).length;
  const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const today = new Date();
  const currentPhaseIdx = launchDateObj
    ? SCHEDULE_PHASES.findIndex(p => { const { start, end } = parsePhaseDates(launchDateObj, p.week); return today >= start && today <= end; })
    : -1;

  return (
    <div>
      {/* ローンチ日設定 */}
      <div style={{ background: '#FFF', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: '#111827' }}>ローンチ日を設定</h3>
            <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>設定すると全フェーズの日程が自動計算されます</p>
          </div>
          <input type="date" value={launchDate} onChange={e => { setLaunchDate(e.target.value); saveProjectData(projectId, 'launchDate', e.target.value); }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, color: '#111827', marginLeft: 'auto' }} />
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>タスク進捗: {doneTasks}/{totalTasks}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{taskPct}%</span>
          </div>
          <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 3, transition: 'width 0.5s', width: `${taskPct}%`, background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }} />
          </div>
        </div>
      </div>

      {/* KPI逆算 */}
      <div style={{ background: '#FFF', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#111827' }}>KPI逆算（6ステップ）</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {KPI_REVERSE_STEPS.map(step => (
            <div key={step.step} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F9FAFB', borderRadius: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: '#6366F1', color: '#FFF', flexShrink: 0 }}>{step.step}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{step.label}</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>{step.description}</div>
              </div>
              <div style={{ fontSize: 11, color: '#6366F1', background: '#EEF2FF', padding: '3px 8px', borderRadius: 6, flexShrink: 0, fontWeight: 500 }}>{step.example}</div>
            </div>
          ))}
        </div>
      </div>

      {/* フェーズ別タイムライン */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SCHEDULE_PHASES.map((phase, pi) => {
          const phaseDone = phase.tasks.filter(t => taskChecks[t.id]).length;
          const phasePct = phase.tasks.length > 0 ? Math.round((phaseDone / phase.tasks.length) * 100) : 0;
          const isCurrent = pi === currentPhaseIdx;
          const isPast = currentPhaseIdx >= 0 && pi < currentPhaseIdx;
          const dateRange = launchDateObj ? getPhaseDate(launchDateObj, phase.week) : null;

          // タスクをアプリ別にグルーピング
          const grouped: { appId: string | null; appName: string; icon: string; port: number | null; tasks: ScheduleTask[] }[] = [];
          phase.tasks.forEach(task => {
            const existing = grouped.find(g => g.appId === task.appId);
            if (existing) { existing.tasks.push(task); }
            else {
              const app = task.appId ? STEP_MAP[task.appId] : null;
              grouped.push({ appId: task.appId, appName: app?.name || '手動タスク', icon: app?.icon || '📋', port: app?.port || null, tasks: [task] });
            }
          });

          return (
            <div key={phase.id} style={{
              background: '#FFF', borderRadius: 16, overflow: 'hidden',
              border: isCurrent ? `2px solid ${phase.color}` : '1px solid #E5E7EB',
              boxShadow: isCurrent ? `0 0 0 3px ${phase.color}20` : '0 1px 3px rgba(0,0,0,0.06)',
              opacity: isPast ? 0.7 : 1,
            }}>
              {/* Phase header */}
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ background: phase.color, color: '#FFF', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>{phase.week}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{phase.title}</span>
                    {isCurrent && <span style={{ fontSize: 10, fontWeight: 600, color: '#FFF', background: phase.color, padding: '2px 8px', borderRadius: 10 }}>NOW</span>}
                  </div>
                  {dateRange && <span style={{ fontSize: 11, color: '#6B7280' }}>{dateRange}</span>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{phaseDone}/{phase.tasks.length}</div>
                  <div style={{ width: 60, height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
                    <div style={{ height: '100%', background: phase.color, width: `${phasePct}%`, borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                </div>
              </div>

              {phase.freezeDeadline && (
                <div style={{ margin: '12px 20px 0', padding: '6px 10px', borderRadius: 6, background: '#FEF2F2', color: '#991B1B', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  🔒 確定締切: {phase.freezeDeadline}
                </div>
              )}

              <div style={{ padding: '12px 20px 16px' }}>
                {/* 成果物 & KPI */}
                <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>📦 成果物</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {phase.deliverables.map(d => <span key={d} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#F3F4F6', color: '#374151' }}>{d}</span>)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>📊 KPI目安</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {phase.kpiTargets.map(k => <span key={k} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#EEF2FF', color: '#4338CA', fontWeight: 500 }}>{k}</span>)}
                    </div>
                  </div>
                </div>

                {/* アプリ別タスク */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {grouped.map(group => (
                    <div key={group.appId || 'manual'} style={{ borderRadius: 10, border: '1px solid #F3F4F6', overflow: 'hidden' }}>
                      {/* アプリヘッダー */}
                      <div style={{ padding: '8px 12px', background: '#F9FAFB', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #F3F4F6' }}>
                        <span style={{ fontSize: 16 }}>{group.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#111827', flex: 1 }}>{group.appName}</span>
                        {group.port && (
                          <a href={`http://localhost:${group.port}`} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 10, color: phase.color, textDecoration: 'none', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: `${phase.color}10`, border: `1px solid ${phase.color}30` }}
                          >開く →</a>
                        )}
                        <span style={{ fontSize: 10, color: '#9CA3AF' }}>
                          {group.tasks.filter(t => taskChecks[t.id]).length}/{group.tasks.length}
                        </span>
                      </div>
                      {/* タスク */}
                      <div style={{ padding: '4px 0' }}>
                        {group.tasks.map(task => (
                          <label key={task.id} style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13,
                            background: taskChecks[task.id] ? '#F0FDF4' : 'transparent',
                            color: taskChecks[task.id] ? '#15803D' : '#374151',
                            textDecoration: taskChecks[task.id] ? 'line-through' : 'none',
                            transition: 'all 0.15s',
                          }}>
                            <input type="checkbox" checked={!!taskChecks[task.id]} onChange={() => toggleTask(task.id)}
                              style={{ width: 16, height: 16, accentColor: phase.color, cursor: 'pointer' }} />
                            {task.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 緊急プロトコル */}
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>🚨 緊急対応プロトコル</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {EMERGENCY_PROTOCOLS.map(ep => (
            <div key={ep.id} style={{ background: '#FFF', borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: ep.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{ep.trigger}</div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>{ep.condition}</div>
                </div>
              </div>
              <div style={{ padding: '12px 20px 16px' }}>
                {ep.actions.map((a, i) => <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#374151', marginBottom: 4 }}><span style={{ color: ep.color, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>{a}</div>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 上乗せ施策 */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>⚡ 上乗せ施策</h3>
        <div style={{ background: '#FFF', borderRadius: 16, padding: 20, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {BOOST_TACTICS.map(t => (
            <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#F9FAFB', borderRadius: 10, marginBottom: 6 }}>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{t.label}</div><div style={{ fontSize: 11, color: '#6B7280' }}>{t.description}</div></div>
              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: '#FEF3C7', color: '#92400E', fontWeight: 600, flexShrink: 0 }}>{t.timing}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', paddingTop: 24, marginTop: 24, borderTop: '1px solid #E5E7EB' }}>
        <button onClick={() => { if (confirm('タスクをすべてリセットしますか？')) { setTaskChecks({}); saveProjectData(projectId, 'tasks', {}); } }}
          style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 20px', fontSize: 12, color: '#9CA3AF', cursor: 'pointer' }}>
          タスクをリセット
        </button>
      </div>
    </div>
  );
}

// ─── KPIタブ ─────────────────────────────────────

function KpiTab({ projectId, kpiValues, setKpiValues }: { projectId: string; kpiValues: Record<string, string>; setKpiValues: (v: Record<string, string>) => void }) {
  function updateKpi(id: string, value: string) {
    const next = { ...kpiValues, [id]: value };
    setKpiValues(next);
    saveProjectData(projectId, 'kpi', next);
  }

  function getStatus(kpi: KpiBenchmark, value: string): 'good' | 'caution' | 'needsWork' | 'none' {
    if (!value || value === '') return 'none';
    const num = parseFloat(value);
    if (isNaN(num)) return 'none';
    const gm = kpi.good.match(/(\d+(?:\.\d+)?)/), cm = kpi.caution.match(/(\d+(?:\.\d+)?)/);
    if (!gm || !cm) return 'none';
    if (num >= parseFloat(gm[1])) return 'good';
    if (num >= parseFloat(cm[1])) return 'caution';
    return 'needsWork';
  }

  const sc = {
    good: { bg: '#D1FAE5', text: '#059669', label: '良好' },
    caution: { bg: '#FEF3C7', text: '#D97706', label: '注意' },
    needsWork: { bg: '#FEE2E2', text: '#DC2626', label: '要改善' },
    none: { bg: '#F3F4F6', text: '#6B7280', label: '未入力' },
  };

  const cats = [
    { id: 'upstream' as const, title: '上流（集客）', color: '#6366F1', icon: '📢' },
    { id: 'midstream' as const, title: '中流（教育）', color: '#F59E0B', icon: '📚' },
    { id: 'downstream' as const, title: '下流（販売）', color: '#EF4444', icon: '💰' },
  ];

  return (
    <div>
      <div style={{ background: '#FFF', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#111827' }}>KPIダッシュボード</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {cats.map(cat => {
            const kpis = KPI_BENCHMARKS.filter(k => k.category === cat.id);
            const good = kpis.filter(k => getStatus(k, kpiValues[k.id]) === 'good').length;
            const filled = kpis.filter(k => kpiValues[k.id] && kpiValues[k.id] !== '').length;
            return (
              <div key={cat.id} style={{ flex: '1 1 200px', padding: '16px 20px', borderRadius: 12, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{cat.icon} {cat.title}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: cat.color }}>{good}/{kpis.length}</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>良好 — {filled}/{kpis.length}入力済み</div>
              </div>
            );
          })}
        </div>
      </div>

      {cats.map(cat => {
        const kpis = KPI_BENCHMARKS.filter(k => k.category === cat.id);
        return (
          <div key={cat.id} style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 20, borderRadius: 2, background: cat.color, display: 'inline-block' }} />{cat.icon} {cat.title}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {kpis.map(kpi => {
                const st = getStatus(kpi, kpiValues[kpi.id]);
                const c = sc[st];
                return (
                  <div key={kpi.id} style={{ background: '#FFF', borderRadius: 12, padding: '14px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 150px', minWidth: 120 }}><div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{kpi.name}</div></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="number" step="0.1" value={kpiValues[kpi.id] || ''} onChange={e => updateKpi(kpi.id, e.target.value)} placeholder="—"
                        style={{ width: 80, padding: '6px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, textAlign: 'right' }} />
                      <span style={{ fontSize: 12, color: '#6B7280', width: 16 }}>{kpi.unit}</span>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: c.bg, color: c.text, minWidth: 48, textAlign: 'center' }}>{c.label}</span>
                    <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#6B7280', flexBasis: '100%', marginTop: 4 }}>
                      <span style={{ padding: '2px 6px', borderRadius: 4, background: '#D1FAE5', color: '#059669' }}>良好: {kpi.good}</span>
                      <span style={{ padding: '2px 6px', borderRadius: 4, background: '#FEF3C7', color: '#D97706' }}>注意: {kpi.caution}</span>
                      <span style={{ padding: '2px 6px', borderRadius: 4, background: '#FEE2E2', color: '#DC2626' }}>要改善: {kpi.needsWork}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={{ textAlign: 'center', paddingTop: 24, borderTop: '1px solid #E5E7EB' }}>
        <button onClick={() => { if (confirm('KPI入力値をすべてリセットしますか？')) { setKpiValues({}); saveProjectData(projectId, 'kpi', {}); } }}
          style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 20px', fontSize: 12, color: '#9CA3AF', cursor: 'pointer' }}>
          KPIをリセット
        </button>
      </div>
    </div>
  );
}

// ─── メインページ ─────────────────────────────────────

export default function LaunchHub() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const [progress, setProgress] = useState<Record<string, StepStatus>>({});
  const [aliveMap, setAliveMap] = useState<Record<string, boolean | null>>({});
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [taskChecks, setTaskChecks] = useState<Record<string, boolean>>({});
  const [launchDate, setLaunchDate] = useState('');
  const [kpiValues, setKpiValues] = useState<Record<string, string>>({});

  // Init: load projects, set active
  useEffect(() => {
    let ps = loadProjects();
    if (ps.length === 0) {
      const defaultProject: Project = { id: genId(), name: 'ローンチ #1', createdAt: new Date().toISOString() };
      ps = [defaultProject];
      saveProjects(ps);
    }
    setProjects(ps);

    const savedActive = localStorage.getItem(ACTIVE_PROJECT_KEY);
    const activeId = savedActive && ps.find(p => p.id === savedActive) ? savedActive : ps[0].id;
    setActiveProjectId(activeId);
    localStorage.setItem(ACTIVE_PROJECT_KEY, activeId);

    // Load project data
    loadProjectState(activeId);

    // Port check
    ALL_STEPS.forEach(step => {
      checkPort(step.port).then(alive => setAliveMap(prev => ({ ...prev, [step.id]: alive })));
    });
  }, []);

  function loadProjectState(pid: string) {
    setProgress(loadProjectData(pid, 'progress', {}));
    setTaskChecks(loadProjectData(pid, 'tasks', {}));
    setLaunchDate(loadProjectData(pid, 'launchDate', ''));
    setKpiValues(loadProjectData(pid, 'kpi', {}));
  }

  function switchProject(pid: string) {
    setActiveProjectId(pid);
    localStorage.setItem(ACTIVE_PROJECT_KEY, pid);
    loadProjectState(pid);
    setShowProjectMenu(false);
  }

  function createProject() {
    if (!newProjectName.trim()) return;
    const p: Project = { id: genId(), name: newProjectName.trim(), createdAt: new Date().toISOString() };
    const next = [...projects, p];
    setProjects(next);
    saveProjects(next);
    setNewProjectName('');
    switchProject(p.id);
  }

  function deleteProject(pid: string) {
    if (projects.length <= 1) return;
    if (!confirm('このプロジェクトを削除しますか？')) return;
    const next = projects.filter(p => p.id !== pid);
    setProjects(next);
    saveProjects(next);
    // Clean up storage
    ['progress', 'tasks', 'launchDate', 'kpi'].forEach(s => localStorage.removeItem(projectKey(pid, s)));
    if (activeProjectId === pid) switchProject(next[0].id);
  }

  function updateStatus(id: string, status: StepStatus) {
    const next = { ...progress, [id]: status };
    setProgress(next);
    saveProjectData(activeProjectId, 'progress', next);
  }

  const activeProject = projects.find(p => p.id === activeProjectId);
  const total = ALL_STEPS.length;
  const doneCount = ALL_STEPS.filter(s => progress[s.id] === 'done').length;
  const doingCount = ALL_STEPS.filter(s => progress[s.id] === 'doing').length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const currentStep = ALL_STEPS.find(s => progress[s.id] === 'doing') || ALL_STEPS.find(s => progress[s.id] !== 'done');

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      {/* ─── Hero ─── */}
      <header style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)', padding: '40px 24px 32px', color: '#FFF' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Launch Hub</h1>
              <p style={{ fontSize: 13, color: '#A5B4FC', margin: '4px 0 0' }}>ローンチに必要な全ツールを一元管理</p>
            </div>

            {/* プロジェクト切替 */}
            {showProjectMenu && <div onClick={() => setShowProjectMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />}
            <div style={{ position: 'relative', zIndex: 50 }}>
              <button onClick={() => setShowProjectMenu(!showProjectMenu)} style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8, padding: '6px 16px', color: '#E0E7FF', fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 16 }}>📁</span>
                {activeProject?.name || 'プロジェクト'}
                <span style={{ fontSize: 10, opacity: 0.6 }}>▼</span>
              </button>

              {showProjectMenu && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 280,
                  background: '#FFF', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                  border: '1px solid #E5E7EB', zIndex: 50, overflow: 'hidden',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 8 }}>プロジェクト一覧</div>
                    {projects.map(p => (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                        background: p.id === activeProjectId ? '#EEF2FF' : 'transparent',
                        marginBottom: 2,
                      }}>
                        <button onClick={() => switchProject(p.id)} style={{
                          flex: 1, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
                          fontSize: 13, fontWeight: p.id === activeProjectId ? 700 : 400,
                          color: p.id === activeProjectId ? '#4338CA' : '#374151',
                        }}>
                          {p.id === activeProjectId && '● '}{p.name}
                        </button>
                        {projects.length > 1 && (
                          <button onClick={() => deleteProject(p.id)} style={{
                            background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#9CA3AF', padding: '2px 4px',
                          }}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                    <input
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && createProject()}
                      placeholder="新しいローンチ名..."
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 12 }}
                    />
                    <button onClick={createProject} style={{
                      padding: '6px 12px', borderRadius: 6, background: '#4338CA', color: '#FFF',
                      border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>追加</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#C7D2FE' }}>全体進捗 — {doneCount}/{total} 完了 {doingCount > 0 && `・${doingCount} 作業中`}</span>
              <span style={{ fontSize: 20, fontWeight: 800 }}>{pct}%</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 4, transition: 'width 0.5s ease', width: `${pct}%`, background: 'linear-gradient(90deg, #34D399, #10B981)' }} />
            </div>
          </div>

          {activeTab === 'dashboard' && currentStep && (
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, backdropFilter: 'blur(8px)' }}>
              <span style={{ fontSize: 24 }}>{currentStep.icon}</span>
              <div>
                <span style={{ fontSize: 11, color: '#A5B4FC' }}>{progress[currentStep.id] === 'doing' ? '現在の作業' : '次のステップ'}</span>
                <p style={{ fontSize: 14, fontWeight: 700, margin: '2px 0 0' }}>{currentStep.name}</p>
              </div>
              <a href={`http://localhost:${currentStep.port}`} target="_blank" rel="noopener noreferrer"
                style={{ marginLeft: 'auto', padding: '8px 20px', borderRadius: 8, background: '#FFF', color: '#312E81', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                開く →
              </a>
            </div>
          )}
        </div>
      </header>

      {/* ─── タブナビ ─── */}
      <nav style={{ background: '#FFF', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 0 }}>
          {([
            { id: 'dashboard' as TabId, label: 'ダッシュボード', icon: '🗂' },
            { id: 'schedule' as TabId, label: 'スケジュール & タスク', icon: '📅' },
            { id: 'kpi' as TabId, label: 'KPIトラッカー', icon: '📊' },
          ]).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '14px 20px', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer',
              color: activeTab === tab.id ? '#4338CA' : '#6B7280',
              borderBottom: activeTab === tab.id ? '2px solid #4338CA' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ─── メインコンテンツ ─── */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 80px' }}>
        {activeTab === 'schedule' && activeProjectId && (
          <ScheduleTab projectId={activeProjectId} launchDate={launchDate} setLaunchDate={setLaunchDate} taskChecks={taskChecks} setTaskChecks={setTaskChecks} />
        )}

        {activeTab === 'kpi' && activeProjectId && (
          <KpiTab projectId={activeProjectId} kpiValues={kpiValues} setKpiValues={setKpiValues} />
        )}

        {activeTab === 'dashboard' && PHASES.map((phase, pi) => {
          const phaseDone = phase.steps.filter(s => progress[s.id] === 'done').length;
          const phaseTotal = phase.steps.length;
          const phasePct = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;
          return (
            <div key={phase.id} style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ background: phase.color, color: '#FFF', padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>{phase.title}</div>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{phase.subtitle}</span>
                <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 'auto' }}>{phaseDone}/{phaseTotal} 完了</span>
                <div style={{ width: 80, height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: phase.color, width: `${phasePct}%`, borderRadius: 2, transition: 'width 0.3s' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {phase.steps.map((step, si) => (
                  <div key={step.id} style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
                    <div style={{ width: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                        background: progress[step.id] === 'done' ? '#10B981' : progress[step.id] === 'doing' ? phase.color : '#E5E7EB',
                        color: progress[step.id] !== 'todo' ? '#FFF' : '#9CA3AF', flexShrink: 0, marginTop: 18,
                      }}>{progress[step.id] === 'done' ? '✓' : si + 1}</div>
                      {si < phase.steps.length - 1 && <div style={{ width: 2, flex: 1, background: progress[step.id] === 'done' ? '#10B981' : '#E5E7EB' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <StepCard step={step} index={si} status={progress[step.id] || 'todo'} alive={aliveMap[step.id] ?? null} progress={progress} onStatusChange={s => updateStatus(step.id, s)} />
                    </div>
                  </div>
                ))}
              </div>
              {pi < PHASES.length - 1 && <div style={{ textAlign: 'center', padding: '16px 0 0', color: '#D1D5DB', fontSize: 20 }}>↓</div>}
            </div>
          );
        })}

        {activeTab === 'dashboard' && (
          <div style={{ textAlign: 'center', paddingTop: 24, borderTop: '1px solid #E5E7EB' }}>
            <button onClick={() => { if (confirm('進捗をすべてリセットしますか？')) { setProgress({}); saveProjectData(activeProjectId, 'progress', {}); } }}
              style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 20px', fontSize: 12, color: '#9CA3AF', cursor: 'pointer' }}>
              進捗をリセット
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
