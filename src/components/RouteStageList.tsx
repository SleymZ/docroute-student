"use client";

import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Info,
} from "lucide-react";

import { AdmissionSources } from "@/components/AdmissionSources";
import type { OfficialSource } from "@/types/admission";
import type { RouteStage, RouteTaskStatus } from "@/types/route-preview";

import styles from "./RoutePreviewScreen.module.css";

// Stage and task list with tickable progress. Same markup and styles as the
// study Preview Route, so both routes look and behave alike.

const statusMeta: Record<RouteTaskStatus, { label: string; icon: typeof CheckCircle2 }> = {
  ready: { label: "Profile aligned", icon: CheckCircle2 },
  action: { label: "Action required", icon: CircleDashed },
  attention: { label: "Needs attention", icon: AlertCircle },
  information: { label: "Important information", icon: Info },
  "not-applicable": { label: "Not applicable", icon: Check },
};

export function isActionableTask(status: RouteTaskStatus) {
  return status === "action" || status === "attention";
}

type RouteStageListProps = {
  stages: RouteStage[];
  sources: OfficialSource[];
  completed: ReadonlySet<string>;
  datedLabels: ReadonlyMap<string, string>;
  onToggle: (taskId: string) => void;
};

export function RouteStageList({
  stages,
  sources,
  completed,
  datedLabels,
  onToggle,
}: RouteStageListProps) {
  return (
    <>
      {stages.map((stage) => {
        const stageActionable = stage.tasks.filter((task) =>
          isActionableTask(task.status),
        );
        const stageCompleted = stageActionable.filter((task) =>
          completed.has(task.id),
        ).length;

        return (
          <section className={styles.stage} key={stage.id}>
            <div className={styles.stageRail}>
              <span>{stage.number}</span>
            </div>

            <div className={styles.stageBody}>
              <header className={styles.stageHeader}>
                <div>
                  <p className={styles.eyebrow}>{stage.eyebrow}</p>
                  <h2>{stage.title}</h2>
                  <p>{stage.description}</p>
                </div>

                <div className={styles.stageTiming}>
                  <Clock3 size={15} aria-hidden="true" />
                  {stage.timing}
                </div>
              </header>

              {stageActionable.length > 0 && (
                <div className={styles.stageProgress}>
                  <span
                    style={{
                      width: `${Math.round(
                        (stageCompleted / stageActionable.length) * 100,
                      )}%`,
                    }}
                  />
                </div>
              )}

              <div className={styles.taskList}>
                {stage.tasks.map((task) => {
                  const meta = statusMeta[task.status];
                  const StatusIcon = meta.icon;
                  const canComplete = isActionableTask(task.status);
                  const done = completed.has(task.id);
                  const due = datedLabels.get(task.id) ?? task.dueLabel;
                  const statusClass =
                    styles[
                      `status${task.status
                        .split("-")
                        .map((part) => part[0].toUpperCase() + part.slice(1))
                        .join("")}`
                    ];

                  return (
                    <article
                      key={task.id}
                      className={`${styles.task} ${done ? styles.taskCompleted : ""}`}
                    >
                      <button
                        type="button"
                        className={styles.taskToggle}
                        disabled={!canComplete}
                        aria-label={
                          done
                            ? `Mark ${task.title} as incomplete`
                            : `Mark ${task.title} as complete`
                        }
                        aria-pressed={done}
                        onClick={() => onToggle(task.id)}
                      >
                        {done ? (
                          <Check size={16} aria-hidden="true" />
                        ) : (
                          <StatusIcon size={16} aria-hidden="true" />
                        )}
                      </button>

                      <div className={styles.taskCopy}>
                        <div className={styles.taskHeading}>
                          <strong>{task.title}</strong>
                          <span className={`${styles.taskStatus} ${statusClass}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p>{task.description}</p>
                        {due && (
                          <small>
                            <CalendarDays size={13} aria-hidden="true" />
                            {due}
                          </small>
                        )}
                        <AdmissionSources sourceIds={task.sourceIds} sources={sources} />
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
