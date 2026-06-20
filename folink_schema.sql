-- SQL Schema File for Neon SQL Editor
-- This file contains all ENUMs, TABLEs, INDEXes, and FOREIGN KEY constraints for Folink

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING', 'BANNED');

-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DELETED');

-- CreateEnum
CREATE TYPE "WithdrawStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('EARNING', 'WITHDRAW', 'BONUS', 'REFERRAL', 'ADJUSTMENT', 'DEPOSIT');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('VALID', 'INVALID', 'FRAUD');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'PAYMENT', 'SECURITY', 'INFO', 'SUPPORT', 'REPORT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "avatar" TEXT,
    "background" TEXT,
    "banner" TEXT,
    "logo" TEXT,
    "walletBalance" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "referralCode" TEXT NOT NULL,
    "referredById" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerified" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "country" TEXT,
    "language" TEXT NOT NULL DEFAULT 'vi',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "twoFactor" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expired" TIMESTAMP(3) NOT NULL,
    "ip" TEXT,
    "browser" TEXT,
    "device" "DeviceType" NOT NULL DEFAULT 'DESKTOP',
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "pendingBalance" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "lockedBalance" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "totalEarned" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "totalWithdraw" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "totalBonus" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(18,6) NOT NULL,
    "fee" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "type" "TransactionType" NOT NULL,
    "status" "WithdrawStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL DEFAULT 'NAPAS',
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "qr" TEXT,
    "amount" DECIMAL(18,6) NOT NULL,
    "fee" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "note" TEXT,
    "status" "WithdrawStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "proofImage" TEXT,
    "approvedById" TEXT,
    "approvedTime" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WithdrawRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "password" TEXT,
    "cpm" DECIMAL(10,4) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "validViews" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "status" "LinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiredAt" TIMESTAMP(3),
    "targetCountry" TEXT,
    "targetDevice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkVisit" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "visitorIp" TEXT NOT NULL,
    "browser" TEXT,
    "device" "DeviceType" NOT NULL DEFAULT 'DESKTOP',
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,
    "referrer" TEXT,
    "fingerprint" TEXT,
    "visitTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reward" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "status" "VisitStatus" NOT NULL DEFAULT 'VALID',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitStep" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "banner" BOOLEAN NOT NULL DEFAULT false,
    "socialBar" BOOLEAN NOT NULL DEFAULT false,
    "captcha" BOOLEAN NOT NULL DEFAULT false,
    "countdown" BOOLEAN NOT NULL DEFAULT false,
    "reward" BOOLEAN NOT NULL DEFAULT false,
    "redirect" BOOLEAN NOT NULL DEFAULT false,
    "completedTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "invitedUserId" TEXT NOT NULL,
    "commission" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "percent" DECIMAL(5,2) NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralEarning" (
    "id" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "amount" DECIMAL(18,6) NOT NULL,
    "transactionId" TEXT NOT NULL,
    "sourceUserId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralEarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "device" TEXT,
    "browser" TEXT,
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "payload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "ip" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "success" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FraudLog" (
    "id" TEXT NOT NULL,
    "visitId" TEXT,
    "reason" TEXT NOT NULL,
    "fingerprint" TEXT,
    "vpn" BOOLEAN NOT NULL DEFAULT false,
    "proxy" BOOLEAN NOT NULL DEFAULT false,
    "bot" BOOLEAN NOT NULL DEFAULT false,
    "emulator" BOOLEAN NOT NULL DEFAULT false,
    "riskScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FraudLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "websiteName" TEXT NOT NULL DEFAULT 'Folink',
    "logo" TEXT,
    "favicon" TEXT,
    "description" TEXT,
    "supportEmail" TEXT NOT NULL DEFAULT 'support@folink.com',
    "maintenance" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT,
    "minimumWithdraw" DECIMAL(18,6) NOT NULL DEFAULT 5.00,
    "maximumWithdraw" DECIMAL(18,6) NOT NULL DEFAULT 1000.00,
    "referralPercent" DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    "defaultCpm" DECIMAL(10,4) NOT NULL DEFAULT 3.00,
    "bannerCode" TEXT,
    "socialBarCode" TEXT,
    "interstitialCode" TEXT,
    "captchaEnabled" BOOLEAN NOT NULL DEFAULT true,
    "countdownSeconds" INTEGER NOT NULL DEFAULT 15,
    "cloudinaryKey" TEXT,
    "cloudinarySecret" TEXT,
    "cloudinaryCloudName" TEXT,
    "adsterraPublisherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdsterraSettings" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT,
    "directLink" TEXT,
    "bannerZone" TEXT,
    "socialBarZone" TEXT,
    "nativeZone" TEXT,
    "popunderZone" TEXT,
    "enableDirectLink" BOOLEAN NOT NULL DEFAULT false,
    "enableBanner" BOOLEAN NOT NULL DEFAULT false,
    "enableSocialBar" BOOLEAN NOT NULL DEFAULT false,
    "enableNative" BOOLEAN NOT NULL DEFAULT false,
    "enablePopunder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdsterraSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannerImages" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "cloudinaryId" TEXT NOT NULL,
    "alt" TEXT,
    "position" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerImages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKeys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastUsed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyStatistics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "validViews" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "users" INTEGER NOT NULL DEFAULT 0,
    "withdraw" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyStatistics" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "withdraw" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "users" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'LOW',
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportMessage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "linkId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CloudinaryAsset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "folder" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CloudinaryAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceFingerprint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "canvas" TEXT,
    "webgl" TEXT,
    "fonts" TEXT,
    "timezone" TEXT,
    "screen" TEXT,
    "language" TEXT,
    "hardwareConcurrency" INTEGER,
    "memory" INTEGER,
    "touchSupport" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceFingerprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IPHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "country" TEXT,
    "asn" TEXT,
    "isp" TEXT,
    "proxy" BOOLEAN NOT NULL DEFAULT false,
    "vpn" BOOLEAN NOT NULL DEFAULT false,
    "tor" BOOLEAN NOT NULL DEFAULT false,
    "hosting" BOOLEAN NOT NULL DEFAULT false,
    "riskScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IPHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "deviceName" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "ip" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "DeviceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "callbackUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "dailyLimit" INTEGER NOT NULL DEFAULT 1000,
    "monthlyLimit" INTEGER NOT NULL DEFAULT 30000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'ONE_BYPASS',
    "requiredBypass" INTEGER NOT NULL DEFAULT 1,
    "completedBypass" INTEGER NOT NULL DEFAULT 0,
    "reward" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiVisit" (
    "id" TEXT NOT NULL,
    "apiKeyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visitorIp" TEXT NOT NULL,
    "fingerprint" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "country" TEXT,
    "riskScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'VALID',
    "reward" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiWebhook" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "retry" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "request" TEXT,
    "response" TEXT,
    "statusCode" INTEGER NOT NULL,
    "ip" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_referralCode_idx" ON "User"("referralCode");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_referenceId_idx" ON "Transaction"("referenceId");

-- CreateIndex
CREATE INDEX "WithdrawRequest_userId_idx" ON "WithdrawRequest"("userId");

-- CreateIndex
CREATE INDEX "WithdrawRequest_status_idx" ON "WithdrawRequest"("status");

-- CreateIndex
CREATE INDEX "WithdrawRequest_createdAt_idx" ON "WithdrawRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Link_slug_key" ON "Link"("slug");

-- CreateIndex
CREATE INDEX "Link_userId_idx" ON "Link"("userId");

-- CreateIndex
CREATE INDEX "Link_slug_idx" ON "Link"("slug");

-- CreateIndex
CREATE INDEX "Link_status_idx" ON "Link"("status");

-- CreateIndex
CREATE INDEX "Link_createdAt_idx" ON "Link"("createdAt");

-- CreateIndex
CREATE INDEX "Link_revenue_idx" ON "Link"("revenue");

-- CreateIndex
CREATE INDEX "LinkVisit_linkId_idx" ON "LinkVisit"("linkId");

-- CreateIndex
CREATE INDEX "LinkVisit_visitorIp_idx" ON "LinkVisit"("visitorIp");

-- CreateIndex
CREATE INDEX "LinkVisit_status_idx" ON "LinkVisit"("status");

-- CreateIndex
CREATE INDEX "LinkVisit_visitTime_idx" ON "LinkVisit"("visitTime");

-- CreateIndex
CREATE INDEX "LinkVisit_fingerprint_idx" ON "LinkVisit"("fingerprint");

-- CreateIndex
CREATE INDEX "LinkVisit_country_idx" ON "LinkVisit"("country");

-- CreateIndex
CREATE INDEX "VisitStep_visitId_idx" ON "VisitStep"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_invitedUserId_key" ON "Referral"("invitedUserId");

-- CreateIndex
CREATE INDEX "Referral_referrerId_idx" ON "Referral"("referrerId");

-- CreateIndex
CREATE INDEX "Referral_invitedUserId_idx" ON "Referral"("invitedUserId");

-- CreateIndex
CREATE INDEX "ReferralEarning_referralId_idx" ON "ReferralEarning"("referralId");

-- CreateIndex
CREATE INDEX "ReferralEarning_transactionId_idx" ON "ReferralEarning"("transactionId");

-- CreateIndex
CREATE INDEX "ReferralEarning_userId_idx" ON "ReferralEarning"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "LoginLog_userId_idx" ON "LoginLog"("userId");

-- CreateIndex
CREATE INDEX "LoginLog_createdAt_idx" ON "LoginLog"("createdAt");

-- CreateIndex
CREATE INDEX "FraudLog_visitId_idx" ON "FraudLog"("visitId");

-- CreateIndex
CREATE INDEX "FraudLog_fingerprint_idx" ON "FraudLog"("fingerprint");

-- CreateIndex
CREATE INDEX "FraudLog_createdAt_idx" ON "FraudLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BannerImages_cloudinaryId_key" ON "BannerImages"("cloudinaryId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKeys_key_key" ON "ApiKeys"("key");

-- CreateIndex
CREATE INDEX "ApiKeys_userId_idx" ON "ApiKeys"("userId");

-- CreateIndex
CREATE INDEX "ApiKeys_key_idx" ON "ApiKeys"("key");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStatistics_date_key" ON "DailyStatistics"("date");

-- CreateIndex
CREATE INDEX "DailyStatistics_date_idx" ON "DailyStatistics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyStatistics_month_key" ON "MonthlyStatistics"("month");

-- CreateIndex
CREATE INDEX "MonthlyStatistics_month_idx" ON "MonthlyStatistics"("month");

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AuditLog_time_idx" ON "AuditLog"("time");

-- CreateIndex
CREATE INDEX "SupportTicket_userId_idx" ON "SupportTicket"("userId");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "SupportMessage_ticketId_idx" ON "SupportMessage"("ticketId");

-- CreateIndex
CREATE INDEX "Report_linkId_idx" ON "Report"("linkId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CloudinaryAsset_publicId_key" ON "CloudinaryAsset"("publicId");

-- CreateIndex
CREATE INDEX "CloudinaryAsset_userId_idx" ON "CloudinaryAsset"("userId");

-- CreateIndex
CREATE INDEX "CloudinaryAsset_publicId_idx" ON "CloudinaryAsset"("publicId");

-- CreateIndex
CREATE INDEX "BankAccount_userId_idx" ON "BankAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceFingerprint_fingerprint_key" ON "DeviceFingerprint"("fingerprint");

-- CreateIndex
CREATE INDEX "DeviceFingerprint_userId_idx" ON "DeviceFingerprint"("userId");

-- CreateIndex
CREATE INDEX "DeviceFingerprint_fingerprint_idx" ON "DeviceFingerprint"("fingerprint");

-- CreateIndex
CREATE INDEX "IPHistory_userId_idx" ON "IPHistory"("userId");

-- CreateIndex
CREATE INDEX "IPHistory_ip_idx" ON "IPHistory"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceSession_sessionId_key" ON "DeviceSession"("sessionId");

-- CreateIndex
CREATE INDEX "DeviceSession_userId_idx" ON "DeviceSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiApplication_apiKey_key" ON "ApiApplication"("apiKey");

-- CreateIndex
CREATE INDEX "ApiApplication_userId_idx" ON "ApiApplication"("userId");

-- CreateIndex
CREATE INDEX "ApiApplication_apiKey_idx" ON "ApiApplication"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_applicationId_idx" ON "ApiKey"("applicationId");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiVisit_apiKeyId_idx" ON "ApiVisit"("apiKeyId");

-- CreateIndex
CREATE INDEX "ApiVisit_userId_idx" ON "ApiVisit"("userId");

-- CreateIndex
CREATE INDEX "ApiWebhook_applicationId_idx" ON "ApiWebhook"("applicationId");

-- CreateIndex
CREATE INDEX "ApiLog_applicationId_idx" ON "ApiLog"("applicationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawRequest" ADD CONSTRAINT "WithdrawRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawRequest" ADD CONSTRAINT "WithdrawRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkVisit" ADD CONSTRAINT "LinkVisit_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitStep" ADD CONSTRAINT "VisitStep_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "LinkVisit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralEarning" ADD CONSTRAINT "ReferralEarning_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralEarning" ADD CONSTRAINT "ReferralEarning_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralEarning" ADD CONSTRAINT "ReferralEarning_sourceUserId_fkey" FOREIGN KEY ("sourceUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralEarning" ADD CONSTRAINT "ReferralEarning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginLog" ADD CONSTRAINT "LoginLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudLog" ADD CONSTRAINT "FraudLog_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "LinkVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKeys" ADD CONSTRAINT "ApiKeys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CloudinaryAsset" ADD CONSTRAINT "CloudinaryAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceFingerprint" ADD CONSTRAINT "DeviceFingerprint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IPHistory" ADD CONSTRAINT "IPHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceSession" ADD CONSTRAINT "DeviceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiApplication" ADD CONSTRAINT "ApiApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ApiApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiVisit" ADD CONSTRAINT "ApiVisit_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiVisit" ADD CONSTRAINT "ApiVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiWebhook" ADD CONSTRAINT "ApiWebhook_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ApiApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiLog" ADD CONSTRAINT "ApiLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ApiApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
