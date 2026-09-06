import type { Part, PartCategory, RuleResult } from "../types";

/**
 * シフター/ブレーキレバー ↔ RD・FD
 * 条件: speed 一致 && actuation 一致
 * (ロードのSTIはshifter1つでシフト+ブレーキを兼ねるため、
 *  actuationはRD/FD側、brake_type/brake_pullはキャリパー側との判定に使う)
 */
export function checkShifterDerailleur(shifter: Part, derailleur: Part): RuleResult {
  const speedOK = shifter.speed === derailleur.speed;
  const actOK = Boolean(
    shifter.actuation && derailleur.actuation && shifter.actuation === derailleur.actuation
  );

  const ok = speedOK && actOK;
  const reasons: string[] = [];
  if (!speedOK) {
    reasons.push(`speed不一致: ${shifter.id} ${shifter.speed ?? "-"} vs ${derailleur.id} ${derailleur.speed ?? "-"}`);
  }
  if (!actOK) {
    reasons.push(`actuation不一致: ${shifter.id} ${shifter.actuation ?? "-"} vs ${derailleur.id} ${derailleur.actuation ?? "-"}`);
  }

  return { ok, reasons };
}

/**
 * RD ↔ カセット/フリーホイール
 * 条件: speed 一致 && (最大歯数 <= RDのmax_sprocket) && (トータル歯数差 <= capacity、算出可能な場合)
 */
export function checkRDvsSprocket(rd: Part, sprocket: Part): RuleResult {
  const speedOK = rd.speed === sprocket.speed;
  const csMax = sprocket.range?.[1];
  const rdMax = rd.max_sprocket;
  const sprocketOK = typeof csMax === "number" ? (typeof rdMax === "number" ? csMax <= rdMax : true) : true;

  const ok = speedOK && sprocketOK;
  const reasons: string[] = [];
  if (!speedOK) reasons.push(`speed不一致: ${rd.id} ${rd.speed ?? "-"} vs ${sprocket.id} ${sprocket.speed ?? "-"}`);
  if (!sprocketOK) reasons.push(`最大スプロケット超過: ${rd.id} max ${rdMax}T < ${sprocket.id} max ${csMax}T`);

  return { ok, reasons };
}

/**
 * チェーン ↔ カセット/フリーホイール
 * 条件: speed 一致
 */
export function checkChainVsSprocket(chain: Part, sprocket: Part): RuleResult {
  const speedOK = chain.speed === sprocket.speed;
  const reasons: string[] = [];
  if (!speedOK) reasons.push(`speed不一致: ${chain.id} ${chain.speed ?? "-"} vs ${sprocket.id} ${sprocket.speed ?? "-"}`);
  return { ok: speedOK, reasons };
}

/**
 * FD ↔ クランクセット
 * 条件1: クランクがシングルチェーンリング(1x)の場合、FDは存在しない(装着不可)
 * 条件2: (アウター歯数 - インナー歯数) <= FDのcapacity
 * 参考: SHIMANO "Front derailleur and crankset" (FC top - low <= FD capacity)
 */
export function checkFrontDerailleurCrankset(fd: Part, crankset: Part): RuleResult {
  const teeth = crankset.crank_teeth;
  if (teeth && teeth.length <= 1) {
    return {
      ok: false,
      reasons: [`${crankset.id}はシングルチェーンリング(1x)構成のため、フロントディレイラー(${fd.id})は使用しません`],
    };
  }

  const spread = teeth && teeth.length >= 2 ? Math.max(...teeth) - Math.min(...teeth) : undefined;
  const capacity = fd.capacity;
  const ok = typeof spread === "number" && typeof capacity === "number" ? spread <= capacity : true;

  const reasons: string[] = [];
  if (!ok) {
    reasons.push(`フロント歯数差超過: ${crankset.id} 歯数差${spread}T > ${fd.id} capacity ${capacity}T`);
  }
  return { ok, reasons };
}

/**
 * クランクセット ↔ ボトムブラケット
 * 条件: スピンドル規格(crank_spindle)が一致
 */
export function checkCranksetBottomBracket(crankset: Part, bb: Part): RuleResult {
  const ok = Boolean(
    crankset.crank_spindle && bb.crank_spindle && crankset.crank_spindle === bb.crank_spindle
  );
  const reasons: string[] = [];
  if (!ok) {
    reasons.push(`スピンドル規格不一致: ${crankset.id} ${crankset.crank_spindle ?? "-"} vs ${bb.id} ${bb.crank_spindle ?? "-"}`);
  }
  return { ok, reasons };
}

/**
 * ハブ ↔ カセット/フリーホイール
 * 条件: フリーハブ規格(freehub)が一致
 */
export function checkHubVsSprocket(hub: Part, sprocket: Part): RuleResult {
  const ok = Boolean(hub.freehub && sprocket.freehub && hub.freehub === sprocket.freehub);
  const reasons: string[] = [];
  if (!ok) {
    reasons.push(`フリーハブ規格不一致: ${hub.id} ${hub.freehub ?? "-"} vs ${sprocket.id} ${sprocket.freehub ?? "-"}`);
  }
  return { ok, reasons };
}

/**
 * ハブ/ホイール ↔ ディスクローター
 * 条件1: ハブがディスク台座を持たない(リムブレーキ専用)場合、ローターは装着不可
 * 条件2: 双方がディスク対応の場合、取付規格(disc_mount: center_lock/six_bolt)が一致
 */
export function checkHubVsRotor(hub: Part, rotor: Part): RuleResult {
  if (!rotor.disc_mount) return { ok: true, reasons: [] };
  if (!hub.disc_mount) {
    return {
      ok: false,
      reasons: [`${hub.id}はディスク台座を持たない(リムブレーキ用)ハブ/ホイールのため、${rotor.id}を装着できません`],
    };
  }
  const ok = hub.disc_mount === rotor.disc_mount;
  const reasons: string[] = [];
  if (!ok) {
    reasons.push(`ディスク取付規格不一致: ${hub.id} ${hub.disc_mount} vs ${rotor.id} ${rotor.disc_mount}`);
  }
  return { ok, reasons };
}

/**
 * カセット ↔ フリーホイール(排他)
 * 条件: 同一ホイールにカセット(フリーハブ式)とフリーホイール(スレッド式)は共存しない。
 * 両方が選択されている時点で常にNG。
 */
export function checkCassetteFreewheelExclusive(cassette: Part, freewheel: Part): RuleResult {
  return {
    ok: false,
    reasons: [
      `${cassette.id}(カセット)と${freewheel.id}(フリーホイール)は同一ホイールに共存できません。どちらか一方を選択してください`,
    ],
  };
}

/**
 * シフター ↔ ブレーキレバー(排他)
 * 条件: シフターがブレーキレバー一体型(STIタイプ、brake_typeを持つ)の場合、
 * 別体ブレーキレバーとの併用は不可。
 * (MTB用トリガーシフターのようにbrake_typeを持たないシフターは、
 *  別体ブレーキレバーと組み合わせるのが正規の構成のためOK)
 */
export function checkShifterBrakeLeverExclusive(shifter: Part, brakeLever: Part): RuleResult {
  const integrated = Boolean(shifter.brake_type);
  if (!integrated) return { ok: true, reasons: [] };
  return {
    ok: false,
    reasons: [
      `${shifter.id}はブレーキレバー一体型(STIタイプ)のため、別体ブレーキレバー(${brakeLever.id})とは併用できません`,
    ],
  };
}

/**
 * ディスクローター ↔ ブレーキキャリパー
 * 条件: 双方がディスクブレーキ規格であること
 */
export function checkRotorVsCaliper(rotor: Part, caliper: Part): RuleResult {
  const ok = Boolean(caliper.brake_type && caliper.brake_type.startsWith("disc"));
  const reasons: string[] = [];
  if (!ok) {
    reasons.push(`${caliper.id} はディスクブレーキ非対応(${caliper.brake_type ?? "-"})のため ${rotor.id} と組み合わせ不可`);
  }
  return { ok, reasons };
}

/**
 * ブレーキレバー(またはSTI兼用のシフター) ↔ ブレーキキャリパー
 * 条件: レバー引き量(brake_pull) と キャリパー要求引き量(required_pull) が一致すること。
 * 参考: SHIMANO "Mechanical Disc brake and Brake lever compatibility" では
 * 機械式ディスクキャリパーとV-BRAKEレバー(pull比が同じ)の組み合わせも適合とされており、
 * brake_type(rim/disc)そのものの一致ではなく引き量の一致で判定する。
 */
export function checkBrakeLeverCaliper(lever: Part, caliper: Part): RuleResult {
  if (!lever.brake_pull || !caliper.required_pull) return { ok: true, reasons: [] };

  const ok = lever.brake_pull === caliper.required_pull;
  const reasons: string[] = [];
  if (!ok) reasons.push(`レバー引き量不一致: ${lever.id} ${lever.brake_pull} vs ${caliper.id} ${caliper.required_pull}`);

  return { ok, reasons };
}

/**
 * 複数ルールの集約
 */
export function summarize(results: RuleResult[]): RuleResult {
  const ok = results.every((r) => r.ok);
  const reasons = results.flatMap((r) => r.reasons);
  return { ok, reasons };
}

interface PairRule {
  a: PartCategory;
  b: PartCategory;
  check: (a: Part, b: Part) => RuleResult;
}

/**
 * カテゴリペアごとの互換ルール表。
 * 選択された2カテゴリの組み合わせがここに存在する場合のみ判定を行う
 * (未選択のカテゴリや、直接の互換関係を持たないペアはスキップする)。
 */
export const PAIR_RULES: PairRule[] = [
  { a: "shifter", b: "rear_derailleur", check: checkShifterDerailleur },
  { a: "shifter", b: "front_derailleur", check: checkShifterDerailleur },
  { a: "rear_derailleur", b: "cassette", check: checkRDvsSprocket },
  { a: "rear_derailleur", b: "freewheel", check: checkRDvsSprocket },
  { a: "chain", b: "cassette", check: checkChainVsSprocket },
  { a: "chain", b: "freewheel", check: checkChainVsSprocket },
  { a: "front_derailleur", b: "crankset", check: checkFrontDerailleurCrankset },
  { a: "crankset", b: "bottom_bracket", check: checkCranksetBottomBracket },
  { a: "hub", b: "cassette", check: checkHubVsSprocket },
  { a: "hub", b: "freewheel", check: checkHubVsSprocket },
  { a: "hub", b: "disc_rotor", check: checkHubVsRotor },
  { a: "disc_rotor", b: "brake_caliper", check: checkRotorVsCaliper },
  { a: "brake_lever", b: "brake_caliper", check: checkBrakeLeverCaliper },
  { a: "shifter", b: "brake_caliper", check: checkBrakeLeverCaliper },
  { a: "cassette", b: "freewheel", check: checkCassetteFreewheelExclusive },
  { a: "shifter", b: "brake_lever", check: checkShifterBrakeLeverExclusive },
];

/**
 * 選択されたパーツ群(カテゴリ->Part)に対し、双方が選択されているペアのみ
 * PAIR_RULESを適用して結果を集約する。
 */
export function evaluateSelection(selected: Partial<Record<PartCategory, Part>>): RuleResult {
  const results: RuleResult[] = [];
  for (const rule of PAIR_RULES) {
    const partA = selected[rule.a];
    const partB = selected[rule.b];
    if (!partA || !partB) continue;
    results.push(rule.check(partA, partB));
  }
  return summarize(results);
}
