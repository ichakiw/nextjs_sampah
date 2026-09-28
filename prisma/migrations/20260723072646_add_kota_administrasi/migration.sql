/*
  Warnings:

  - Added the required column `kotaAdministrasi` to the `wilayah` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "wilayah" ADD COLUMN     "kotaAdministrasi" TEXT NOT NULL;
