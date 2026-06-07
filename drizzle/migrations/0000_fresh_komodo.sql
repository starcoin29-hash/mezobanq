CREATE TYPE "public"."gift_card_status" AS ENUM('active', 'claimed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."position_status" AS ENUM('active', 'closed', 'liquidated');--> statement-breakpoint
CREATE TYPE "public"."tx_type" AS ENUM('borrow', 'repay', 'send', 'receive', 'gift_create', 'gift_claim', 'yield_deposit', 'yield_withdraw');--> statement-breakpoint
CREATE TABLE "gift_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_code" varchar(16) NOT NULL,
	"creator_id" uuid,
	"claimer_id" uuid,
	"amount_musd" numeric(18, 2) NOT NULL,
	"message" text,
	"theme" varchar(30) DEFAULT 'bitcoin',
	"status" "gift_card_status" DEFAULT 'active',
	"lock_tx_hash" text,
	"claim_tx_hash" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"claimed_at" timestamp,
	CONSTRAINT "gift_cards_claim_code_unique" UNIQUE("claim_code")
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tx_hash" text,
	"collateral_btc" numeric(18, 8),
	"collateral_usd_at_open" numeric(18, 2),
	"borrowed_musd" numeric(18, 2),
	"interest_rate" numeric(5, 2) DEFAULT '1.00',
	"ltv_ratio" numeric(5, 4),
	"on_chain_position_id" text,
	"status" "position_status" DEFAULT 'active',
	"opened_at" timestamp DEFAULT now(),
	"closed_at" timestamp,
	CONSTRAINT "positions_tx_hash_unique" UNIQUE("tx_hash")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"type" "tx_type" NOT NULL,
	"amount" numeric(18, 8),
	"currency" varchar(10) DEFAULT 'MUSD',
	"tx_hash" text,
	"from_address" varchar(42),
	"to_address" varchar(42),
	"metadata" jsonb,
	"block_number" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"wallet_address" varchar(42),
	"username" varchar(50),
	"email" text,
	"is_verified" boolean DEFAULT false,
	"passport_token_id" text,
	"referral_code" varchar(12),
	"display_currency" varchar(5) DEFAULT 'USD',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "yield_positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"protocol" varchar(50),
	"deposited_musd" numeric(18, 2),
	"current_apy" numeric(6, 2),
	"earned_musd" numeric(18, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"deposit_tx_hash" text,
	"deposited_at" timestamp DEFAULT now(),
	"last_harvested_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_claimer_id_users_id_fk" FOREIGN KEY ("claimer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "yield_positions" ADD CONSTRAINT "yield_positions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "positions_user_idx" ON "positions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "positions_status_idx" ON "positions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tx_user_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tx_type_idx" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "users_wallet_idx" ON "users" USING btree ("wallet_address");