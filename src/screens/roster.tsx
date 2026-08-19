import { useState } from "react";
import { Frame, Icon, Panel, PixelButton, RobotSprite, StatBar } from "@/components/game/pixel";
import { TRAIN_COST_PER_POINT } from "@/game/config";
import { baseStats, maxTrained, robotMaxXP, type RobotSave } from "@/game/engine";
import { addGold, setTeam, updateRobots, useGame } from "@/game/save";
import { faceUrl, ROBOT_MAP, ROBOTS } from "@/game/robots";

export function RosterScreen({ onBack }: { onBack: () => void }) {
  const g = useGame();
  const [selected, setSelected] = useState<string | null>(null);
  const sel = g.robots.find((r) => r.id === selected) ?? null;

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <TopBar title="MEUS ROBOS" gold={g.gold} onBack={onBack} />

      <div className="mk-scroll" style={{ flex: 1, padding: 8 }}>
        <div className="mk-title" style={{ fontSize: 7, color: "var(--mk-muted)", marginBottom: 6 }}>
          EQUIPE ({g.team.length}/4) — toque num robo para ver, treinar e escalar
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
            gap: 8,
          }}
        >
          {g.robots.map((r) => {
            const def = ROBOT_MAP[r.id];
            const inTeam = g.team.includes(r.id);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelected(r.id)}
                style={{
                  background: inTeam ? "rgba(53,226,240,0.16)" : "rgba(8,16,28,0.8)",
                  border: `2px solid ${inTeam ? "var(--mk-accent)" : "rgba(80,110,140,0.5)"}`,
                  padding: 4,
                  display: "grid",
                  placeItems: "center",
                  gap: 2,
                  cursor: "pointer",
                }}
              >
                <Frame rarity={def.rarity} size={72}>
                  <img
                    src={faceUrl(r.id)}
                    alt=""
                    style={{ width: "100%", height: "100%", imageRendering: "pixelated" }}
                  />
                </Frame>
                <span className="mk-title" style={{ fontSize: 6 }}>
                  {def.name}
                </span>
                <span className="mk-title" style={{ fontSize: 6, color: "var(--mk-accent2)" }}>
                  Lv{r.level}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="mk-title"
          style={{ fontSize: 7, color: "var(--mk-muted)", margin: "14px 0 6px" }}
        >
          NAO RECRUTADOS ({ROBOTS.length - g.robots.length}/20) — use CAPSULA MECHA na loja
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
            gap: 8,
          }}
        >
          {ROBOTS.filter((d) => !g.robots.some((r) => r.id === d.id)).map((def) => (
            <div
              key={def.id}
              style={{
                background: "rgba(8,16,28,0.8)",
                border: "2px solid rgba(60,80,104,0.45)",
                padding: 4,
                display: "grid",
                placeItems: "center",
                gap: 2,
              }}
            >
              <Frame rarity={def.rarity} size={72}>
                <img
                  src={faceUrl(def.id)}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    imageRendering: "pixelated",
                    filter: "grayscale(1) brightness(0.35) contrast(1.2)",
                  }}
                />
              </Frame>
              <span className="mk-title" style={{ fontSize: 6, color: "var(--mk-muted)" }}>
                ? ? ? ?
              </span>
              <span className="mk-title" style={{ fontSize: 6, color: "var(--mk-muted)" }}>
                {def.rarity.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
        <div style={{ height: 52 }} />
      </div>

      {sel && <RobotDetail save={sel} onClose={() => setSelected(null)} />}
    </div>
  );
}

function RobotDetail({ save, onClose }: { save: RobotSave; onClose: () => void }) {
  const g = useGame();
  const def = ROBOT_MAP[save.id];
  const base = baseStats(def.ratios, save.level);
  const cap = maxTrained(def.ratios, save.level);
  const cost = TRAIN_COST_PER_POINT * save.level;
  const inTeam = g.team.includes(save.id);

  function train(stat: "str" | "def" | "agl") {
    if (g.gold < cost || save.trained[stat] >= cap[stat]) return;
    addGold(-cost);
    updateRobots(
      g.robots.map((r) =>
        r.id === save.id ? { ...r, trained: { ...r.trained, [stat]: r.trained[stat] + 1 } } : r,
      ),
    );
  }

  function toggleTeam() {
    if (inTeam) {
      if (g.team.length <= 1) return;
      setTeam(g.team.filter((id) => id !== save.id));
    } else {
      if (g.team.length >= 4) return;
      setTeam([...g.team, save.id]);
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(3,6,12,0.86)",
        display: "grid",
        placeItems: "center",
        padding: 8,
        zIndex: 5,
      }}
    >
      <Panel style={{ width: "min(94vw, 420px)", maxHeight: "88vh", overflow: "hidden" }}>
        <div className="mk-scroll" style={{ maxHeight: "76vh", paddingRight: 4 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <RobotSprite robotId={save.id} clip="idle" size={104} fps={4} />
            <div style={{ flex: 1 }}>
              <div className="mk-title" style={{ fontSize: 11 }}>
                {def.name}
              </div>
              <div className="mk-title" style={{ fontSize: 7, color: "var(--mk-accent)" }}>
                {def.element} · {def.rarity.toUpperCase()} · Lv{save.level}
              </div>
              <div style={{ marginTop: 4 }}>
                <StatBar kind="xp" value={save.xp} max={robotMaxXP(save.level)} width={150} />
              </div>
            </div>
          </div>

          <div style={{ fontSize: 10, color: "var(--mk-muted)", margin: "8px 0" }}>{def.bio}</div>

          <div className="mk-title" style={{ fontSize: 8, marginBottom: 4 }}>
            ATRIBUTOS
          </div>
          <StatRow label="HP" value={base.hp} />
          <StatRow label="MP" value={base.mp} />
          <TrainRow
            label="FORCA"
            base={base.str}
            trained={save.trained.str}
            cap={cap.str}
            cost={cost}
            gold={g.gold}
            onTrain={() => train("str")}
          />
          <TrainRow
            label="DEFESA"
            base={base.def}
            trained={save.trained.def}
            cap={cap.def}
            cost={cost}
            gold={g.gold}
            onTrain={() => train("def")}
          />
          <TrainRow
            label="AGILIDADE"
            base={base.agl}
            trained={save.trained.agl}
            cap={cap.agl}
            cost={cost}
            gold={g.gold}
            onTrain={() => train("agl")}
          />

          <div className="mk-title" style={{ fontSize: 8, margin: "10px 0 4px" }}>
            HABILIDADES
          </div>
          {def.skills.map((s) => (
            <div
              key={s.id}
              style={{
                border: "2px solid rgba(53,226,240,0.35)",
                background: "rgba(8,18,32,0.7)",
                padding: 5,
                marginBottom: 4,
              }}
            >
              <div
                className="mk-title"
                style={{ fontSize: 7, display: "flex", justifyContent: "space-between" }}
              >
                <span>
                  <Icon name={s.kind === "defense" ? "shield" : "fist"} size={10} /> {s.name}
                </span>
                <span style={{ color: "var(--mk-accent)" }}>{s.mp} MP</span>
              </div>
              <div style={{ fontSize: 10, color: "var(--mk-muted)" }}>{s.desc}</div>
            </div>
          ))}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
            <PixelButton onClick={toggleTeam}>{inTeam ? "TIRAR DA EQUIPE" : "ESCALAR"}</PixelButton>
            <PixelButton onClick={onClose}>FECHAR</PixelButton>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="mk-title"
      style={{ fontSize: 7, display: "flex", justifyContent: "space-between", padding: "2px 0" }}
    >
      <span>{label}</span>
      <span style={{ color: "var(--mk-text)" }}>{value}</span>
    </div>
  );
}

function TrainRow({
  label,
  base,
  trained,
  cap,
  cost,
  gold,
  onTrain,
}: {
  label: string;
  base: number;
  trained: number;
  cap: number;
  cost: number;
  gold: number;
  onTrain: () => void;
}) {
  const full = trained >= cap;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
        padding: "3px 0",
      }}
    >
      <span className="mk-title" style={{ fontSize: 7 }}>
        {label}
      </span>
      <span className="mk-title" style={{ fontSize: 7, flex: 1, textAlign: "right" }}>
        {base + trained}{" "}
        <span style={{ color: "var(--mk-accent)" }}>
          ({trained}/{cap})
        </span>
      </span>
      <button
        type="button"
        className="mk-btn mk-btn-sq"
        disabled={full || gold < cost}
        onClick={onTrain}
        title={`Treinar por ${cost} de ouro`}
        style={{ fontSize: 7, padding: 0 }}
      >
        {full ? "MAX" : `+1 · ${cost}`}
      </button>
    </div>
  );
}

export function TopBar({
  title,
  gold,
  onBack,
}: {
  title: string;
  gold: number;
  onBack: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 8px",
        background: "rgba(6,12,22,0.95)",
        borderBottom: "2px solid rgba(53,226,240,0.4)",
      }}
    >
      <button
        type="button"
        className="mk-btn mk-btn-sq"
        onClick={onBack}
        style={{ fontSize: 8, padding: 0 }}
      >
        VOLTAR
      </button>
      <span className="mk-title" style={{ fontSize: 9, flex: 1 }}>
        {title}
      </span>
      <span className="mk-title" style={{ fontSize: 8, color: "var(--mk-accent2)" }}>
        <Icon name="coins" size={12} /> {gold}
      </span>
    </div>
  );
}
