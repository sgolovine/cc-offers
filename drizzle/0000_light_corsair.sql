CREATE TABLE `credit_card_offers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`issuer` text NOT NULL,
	`card_offer` text NOT NULL,
	`segment` text,
	`category` text,
	`welcome_intro_offer` text,
	`bonus_miles` text,
	`cash_bonus` text,
	`spend_requirement` text,
	`spend_timeframe_days_tier_1` text,
	`spend_requirement_timing` text,
	`base_annual_fee_usd` integer,
	`additional_user_annual_fee_usd` integer,
	`additional_requirements_annual_fee` text,
	`intro_apr` text,
	`regular_apr` text,
	`rewards_key_perks` text,
	`source_url` text NOT NULL,
	`source_basis` text NOT NULL,
	`retrieved` text NOT NULL,
	`notes` text,
	`raw_json` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`issuer_partner` text,
	`spend_requirement_extra_reqs` text,
	`bonus_miles_type` text,
	`spend_timeframe_days_tier_2` text,
	`cash_bonus_type` text
);
--> statement-breakpoint
CREATE INDEX `credit_card_offers_issuer_idx` ON `credit_card_offers` (`issuer`);--> statement-breakpoint
CREATE INDEX `credit_card_offers_category_idx` ON `credit_card_offers` (`category`);--> statement-breakpoint
CREATE INDEX `credit_card_offers_retrieved_idx` ON `credit_card_offers` (`retrieved`);--> statement-breakpoint
CREATE TABLE `institution_targets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`institution` text NOT NULL,
	`institution_type` text NOT NULL,
	`role` text NOT NULL,
	`known_issuer_partner` text,
	`known_rewards_card_examples` text,
	`offer_research_url` text NOT NULL,
	`alternate_issuer_url` text,
	`source_basis` text NOT NULL,
	`public_signal` text NOT NULL,
	`priority` text NOT NULL,
	`retrieved` text NOT NULL,
	`notes` text,
	`raw_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `institution_targets_institution_url_unique` ON `institution_targets` (`institution`,`offer_research_url`);--> statement-breakpoint
CREATE INDEX `institution_targets_type_idx` ON `institution_targets` (`institution_type`);--> statement-breakpoint
CREATE INDEX `institution_targets_priority_idx` ON `institution_targets` (`priority`);