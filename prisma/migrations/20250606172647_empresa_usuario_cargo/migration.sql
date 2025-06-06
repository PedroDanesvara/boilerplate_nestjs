-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "CargoEmpresa" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "EmpresaUsuario" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "cargo" "CargoEmpresa" NOT NULL DEFAULT 'USER',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmpresaUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmpresaUsuario_user_id_empresa_id_key" ON "EmpresaUsuario"("user_id", "empresa_id");

-- AddForeignKey
ALTER TABLE "EmpresaUsuario" ADD CONSTRAINT "EmpresaUsuario_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpresaUsuario" ADD CONSTRAINT "EmpresaUsuario_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
