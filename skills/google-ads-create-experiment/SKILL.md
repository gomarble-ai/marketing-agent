---
name: google-ads-create-experiment
description: "Use when launching a Google Ads experiment. Loaded after the create master skill."
---
# Google Ads — Create / Update Experiment

Tools: `google_ads_propose_create_experiment`, `google_ads_propose_update_experiment`. Tool schemas describe shape; this skill covers the business rules.

## V1 Capability Surface

- `type`: `SEARCH_CUSTOM` only. No `DISPLAY_CUSTOM`, no `SHOPPING`, no `YOUTUBE`. Reject any other type up front.
- `base_campaign_id`: must reference an existing campaign with `advertising_channel_type = SEARCH`.

## How experiments work in V1

Two-arm A/B test on a single base campaign:
1. Propose tool creates the Experiment (status `SETUP`), then both ExperimentArms — control reuses base campaign; treatment forks a draft campaign.
2. Optional `draft_modifications` apply to the treatment's draft campaign.
3. Propose tool calls `experiments/{id}:scheduleExperiment` (Google long-running operation) and polls until done.

## Non-Schema Rules

- `traffic_split.control` + `traffic_split.treatment` must sum to 100. Each in 1–99.
- `start_date`: ≥ today + 1 day, within ~1 year.
- `end_date`: > `start_date`.
- Experiment `name` is unique per customer — duplicate names reject. Append a suffix and retry.
- **`draft_modifications.daily_budget` is propose-side advertised but the executor does NOT push it.** Tell the user budget changes on the draft campaign aren't supported in V1; propose a separate post-schedule update if they want one.

## Lifecycle Actions (update)

We expose ENABLE/PAUSE-style transitions and Google's lifecycle promotions. We do **not** expose entity removal.

| `action` | Effect | Allowed from |
|---|---|---|
| `RENAME` | Rename experiment | any state |
| `PAUSE` | Pause running experiment | `RUNNING` |
| `RESUME` | Resume paused experiment | `HALTED` |
| `END` | End experiment immediately (LRO) | `RUNNING` / `GRADUATED` |
| `PROMOTE` | Promote treatment to base (LRO) | `RUNNING` / `ENDED` |
| `GRADUATE` | Convert treatment into a standalone campaign (LRO) | `RUNNING` |

`END`, `PROMOTE`, `GRADUATE` use Google's long-running operation system. The executor polls until done; failures show up in the LRO's `error` field. Common LRO errors:
- `START_DATE_TOO_FAR_IN_FUTURE`
- `CANNOT_CREATE_EXPERIMENT_CAMPAIGN_WITH_SHARED_BUDGET`

Surface these directly to the user — they're fixable in the Ads UI by adjusting dates or detaching the shared budget.

## Output After Execution

Create:
> Done. Created and scheduled experiment `<name>` (id `<id>`). `<control>`/`<treatment>` split on campaign `<base_name>`. Treatment draft: `<draft_name>`. Will start `<start_date>`.

Update:
> Done. `<action>` on experiment `<name>` (id `<id>`).
