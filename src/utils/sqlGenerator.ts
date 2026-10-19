export const MYSQL_SCHEMA_SQL = `-- ====================================================================
-- SKEMA DATABASE PERSATUAN PERANGKAT DESA INDONESIA (PPDI) KAB. BANDUNG
-- Engine: MySQL 8.0+ / MariaDB 10.6+
-- Charset: utf8mb4_unicode_ci
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. TABEL ref_kecamatan
CREATE TABLE IF NOT EXISTS \`ref_kecamatan\` (
  \`id_kecamatan\` VARCHAR(10) NOT NULL COMMENT 'Kode Wilayah Kemendagri e.g. 32.04.05',
  \`nama_kecamatan\` VARCHAR(100) NOT NULL,
  PRIMARY KEY (\`id_kecamatan\`),
  KEY \`idx_nama_kecamatan\` (\`nama_kecamatan\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABEL ref_desa
CREATE TABLE IF NOT EXISTS \`ref_desa\` (
  \`id_desa\` VARCHAR(20) NOT NULL COMMENT 'Kode Kemendagri e.g. 32.04.05.2001',
  \`id_kecamatan\` VARCHAR(10) NOT NULL,
  \`nama_desa\` VARCHAR(100) NOT NULL,
  \`alamat_kantor_desa\` TEXT NULL,
  PRIMARY KEY (\`id_desa\`),
  KEY \`idx_desa_kecamatan\` (\`id_kecamatan\`),
  KEY \`idx_nama_desa\` (\`nama_desa\`),
  CONSTRAINT \`fk_desa_kecamatan\` FOREIGN KEY (\`id_kecamatan\`) 
    REFERENCES \`ref_kecamatan\` (\`id_kecamatan\`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABEL ref_jabatan
CREATE TABLE IF NOT EXISTS \`ref_jabatan\` (
  \`id_jabatan\` INT AUTO_INCREMENT NOT NULL,
  \`nama_jabatan\` VARCHAR(100) NOT NULL,
  \`kategori_jabatan\` ENUM('Sekretariat', 'Pelaksana Teknis', 'Pelaksana Kewilayahan', 'Kepala Desa') NOT NULL,
  PRIMARY KEY (\`id_jabatan\`),
  KEY \`idx_kategori_jabatan\` (\`kategori_jabatan\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABEL anggota (Data Induk Perangkat Desa)
CREATE TABLE IF NOT EXISTS \`anggota\` (
  \`id_anggota\` VARCHAR(36) NOT NULL COMMENT 'UUID / BIGINT identifier',
  \`nik\` VARCHAR(16) NOT NULL COMMENT '16 digit NIK KTP',
  \`niap_nipd\` VARCHAR(30) NULL COMMENT 'Nomor Induk Perangkat Desa',
  \`nama_lengkap\` VARCHAR(150) NOT NULL,
  \`gelar_depan\` VARCHAR(30) NULL,
  \`gelar_belakang\` VARCHAR(50) NULL,
  \`tempat_lahir\` VARCHAR(100) NOT NULL,
  \`tanggal_lahir\` DATE NOT NULL COMMENT 'Dasar kalkulasi pensiun 60 tahun',
  \`jenis_kelamin\` ENUM('L', 'P') NOT NULL,
  \`agama\` VARCHAR(30) NOT NULL DEFAULT 'Islam',
  \`pendidikan_terakhir\` ENUM('SMA/SMK', 'D3', 'S1', 'S2') NOT NULL,
  \`no_hp_wa\` VARCHAR(20) NOT NULL COMMENT 'Nomor WA aktif untuk notifikasi',
  \`email\` VARCHAR(100) NULL,
  \`foto\` VARCHAR(255) NULL,
  \`alamat_rumah\` TEXT NOT NULL,
  \`status_pernikahan\` ENUM('Kawin', 'Belum Kawin', 'Cerai Hidup', 'Cerai Mati') NOT NULL DEFAULT 'Kawin',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id_anggota\`),
  UNIQUE KEY \`uq_anggota_nik\` (\`nik\`),
  KEY \`idx_anggota_tgl_lahir\` (\`tanggal_lahir\`),
  KEY \`idx_anggota_nama\` (\`nama_lengkap\`),
  KEY \`idx_anggota_hp\` (\`no_hp_wa\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABEL riwayat_jabatan (Rekam Jejak Karir & SK)
CREATE TABLE IF NOT EXISTS \`riwayat_jabatan\` (
  \`id_riwayat\` VARCHAR(36) NOT NULL,
  \`id_anggota\` VARCHAR(36) NOT NULL,
  \`id_desa\` VARCHAR(20) NOT NULL,
  \`id_jabatan\` INT NOT NULL,
  \`no_sk_pengangkatan\` VARCHAR(100) NOT NULL,
  \`tgl_sk_pengangkatan\` DATE NOT NULL,
  \`tmt_jabatan\` DATE NOT NULL COMMENT 'Terhitung Mulai Tanggal',
  \`status_aktif\` ENUM('Aktif', 'Purna Tugas', 'Meninggal Dunia', 'Diberhentikan', 'Mutasi') NOT NULL DEFAULT 'Aktif',
  \`file_sk\` VARCHAR(255) NULL COMMENT 'Path / URL file PDF SK',
  \`keterangan\` TEXT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id_riwayat\`),
  KEY \`idx_riwayat_anggota\` (\`id_anggota\`),
  KEY \`idx_riwayat_desa\` (\`id_desa\`),
  KEY \`idx_riwayat_jabatan\` (\`id_jabatan\`),
  KEY \`idx_riwayat_status\` (\`status_aktif\`),
  CONSTRAINT \`fk_riwayat_anggota\` FOREIGN KEY (\`id_anggota\`) 
    REFERENCES \`anggota\` (\`id_anggota\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_riwayat_desa\` FOREIGN KEY (\`id_desa\`) 
    REFERENCES \`ref_desa\` (\`id_desa\`) ON UPDATE CASCADE,
  CONSTRAINT \`fk_riwayat_jabatan\` FOREIGN KEY (\`id_jabatan\`) 
    REFERENCES \`ref_jabatan\` (\`id_jabatan\`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABEL keanggotaan_ppdi (KTA & Organisasi)
CREATE TABLE IF NOT EXISTS \`keanggotaan_ppdi\` (
  \`id_ppdi\` VARCHAR(36) NOT NULL,
  \`id_anggota\` VARCHAR(36) NOT NULL,
  \`no_kta\` VARCHAR(50) NOT NULL COMMENT 'Format: 32.04.[KodeKec].[KodeDesa].[NoUrut]',
  \`tgl_bergabung\` DATE NOT NULL,
  \`jabatan_pengurus\` VARCHAR(100) NOT NULL DEFAULT 'Anggota Biasa',
  \`status_kta\` ENUM('Aktif', 'Pending', 'Non-Aktif') NOT NULL DEFAULT 'Aktif',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id_ppdi\`),
  UNIQUE KEY \`uq_ppdi_no_kta\` (\`no_kta\`),
  UNIQUE KEY \`uq_ppdi_anggota\` (\`id_anggota\`),
  KEY \`idx_ppdi_status\` (\`status_kta\`),
  CONSTRAINT \`fk_ppdi_anggota\` FOREIGN KEY (\`id_anggota\`) 
    REFERENCES \`anggota\` (\`id_anggota\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABEL iuran_anggota (Keuangan Transaksional)
CREATE TABLE IF NOT EXISTS \`iuran_anggota\` (
  \`id_iuran\` VARCHAR(36) NOT NULL,
  \`id_anggota\` VARCHAR(36) NOT NULL,
  \`tahun\` SMALLINT NOT NULL,
  \`bulan\` TINYINT NOT NULL COMMENT '1-12',
  \`jumlah\` DECIMAL(12,2) NOT NULL DEFAULT 35000.00,
  \`tgl_bayar\` DATETIME NOT NULL,
  \`bukti_trf\` VARCHAR(255) NULL,
  \`status_verifikasi\` ENUM('Pending', 'Lunas', 'Ditolak') NOT NULL DEFAULT 'Pending',
  \`catatan\` VARCHAR(255) NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id_iuran\`),
  KEY \`idx_iuran_anggota\` (\`id_anggota\`),
  KEY \`idx_iuran_periode\` (\`tahun\`, \`bulan\`),
  KEY \`idx_iuran_status\` (\`status_verifikasi\`),
  CONSTRAINT \`fk_iuran_anggota\` FOREIGN KEY (\`id_anggota\`) 
    REFERENCES \`anggota\` (\`id_anggota\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TABEL users (Akses Sistem & RBAC)
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id_user\` INT AUTO_INCREMENT NOT NULL,
  \`username\` VARCHAR(50) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL,
  \`password\` VARCHAR(255) NOT NULL COMMENT 'Argon2 / BCRYPT Hash',
  \`role\` ENUM('Superadmin_Kabupaten', 'Admin_Kecamatan', 'Anggota') NOT NULL DEFAULT 'Anggota',
  \`id_anggota\` VARCHAR(36) NULL,
  \`id_kecamatan\` VARCHAR(10) NULL COMMENT 'Filter teritorial Admin Kecamatan',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id_user\`),
  UNIQUE KEY \`uq_user_username\` (\`username\`),
  UNIQUE KEY \`uq_user_email\` (\`email\`),
  KEY \`idx_user_role\` (\`role\`),
  CONSTRAINT \`fk_users_anggota\` FOREIGN KEY (\`id_anggota\`) 
    REFERENCES \`anggota\` (\`id_anggota\`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT \`fk_users_kecamatan\` FOREIGN KEY (\`id_kecamatan\`) 
    REFERENCES \`ref_kecamatan\` (\`id_kecamatan\`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- VIEWS OPTIMASI & AGREGASI KHUSUS (Agregat & Reporting)
-- ====================================================================

-- View 1: Data Anggota Aktif Lengkap dengan Teritorial
CREATE OR REPLACE VIEW \`v_anggota_aktif_kabupaten\` AS
SELECT 
    a.id_anggota,
    a.nik,
    a.niap_nipd,
    CONCAT(IFNULL(CONCAT(a.gelar_depan, ' '), ''), a.nama_lengkap, IFNULL(CONCAT(', ', a.gelar_belakang), '')) AS nama_berkelar,
    a.tanggal_lahir,
    TIMESTAMPDIFF(YEAR, a.tanggal_lahir, CURDATE()) AS usia_saat_ini,
    (60 - TIMESTAMPDIFF(YEAR, a.tanggal_lahir, CURDATE())) AS sisa_tahun_pensiun,
    a.pendidikan_terakhir,
    a.no_hp_wa,
    k.nama_kecamatan,
    d.nama_desa,
    j.nama_jabatan,
    j.kategori_jabatan,
    rj.no_sk_pengangkatan,
    rj.tmt_jabatan,
    kp.no_kta,
    kp.status_kta,
    kp.jabatan_pengurus
FROM anggota a
JOIN riwayat_jabatan rj ON a.id_anggota = rj.id_anggota AND rj.status_aktif = 'Aktif'
JOIN ref_desa d ON rj.id_desa = d.id_desa
JOIN ref_kecamatan k ON d.id_kecamatan = k.id_kecamatan
JOIN ref_jabatan j ON rj.id_jabatan = j.id_jabatan
LEFT JOIN keanggotaan_ppdi kp ON a.id_anggota = kp.id_anggota;

-- View 2: Peringatan Dini Batas Purna Tugas (Usia 60 Tahun)
CREATE OR REPLACE VIEW \`v_purna_tugas_alert\` AS
SELECT 
    a.id_anggota,
    a.nik,
    a.nama_lengkap,
    a.no_hp_wa,
    a.tanggal_lahir,
    DATE_ADD(a.tanggal_lahir, INTERVAL 60 YEAR) AS tanggal_purna_tugas,
    PERIOD_DIFF(EXTRACT(YEAR_MONTH FROM DATE_ADD(a.tanggal_lahir, INTERVAL 60 YEAR)), EXTRACT(YEAR_MONTH FROM CURDATE())) AS sisa_bulan_pensiun,
    k.nama_kecamatan,
    d.nama_desa,
    j.nama_jabatan,
    CASE 
        WHEN DATE_ADD(a.tanggal_lahir, INTERVAL 60 YEAR) <= CURDATE() THEN 'Sudah Purna Tugas'
        WHEN PERIOD_DIFF(EXTRACT(YEAR_MONTH FROM DATE_ADD(a.tanggal_lahir, INTERVAL 60 YEAR)), EXTRACT(YEAR_MONTH FROM CURDATE())) <= 6 THEN 'Kritis (<6 Bulan)'
        WHEN PERIOD_DIFF(EXTRACT(YEAR_MONTH FROM DATE_ADD(a.tanggal_lahir, INTERVAL 60 YEAR)), EXTRACT(YEAR_MONTH FROM CURDATE())) <= 12 THEN 'Siaga (<1 Tahun)'
        WHEN PERIOD_DIFF(EXTRACT(YEAR_MONTH FROM DATE_ADD(a.tanggal_lahir, INTERVAL 60 YEAR)), EXTRACT(YEAR_MONTH FROM CURDATE())) <= 24 THEN 'Waspada (<2 Tahun)'
        ELSE 'Aman'
    END AS status_peringatan
FROM anggota a
JOIN riwayat_jabatan rj ON a.id_anggota = rj.id_anggota AND rj.status_aktif = 'Aktif'
JOIN ref_desa d ON rj.id_desa = d.id_desa
JOIN ref_kecamatan k ON d.id_kecamatan = k.id_kecamatan
JOIN ref_jabatan j ON rj.id_jabatan = j.id_jabatan
ORDER BY sisa_bulan_pensiun ASC;
`;

export const LARAVEL_MIGRATION_CODE = `<?php
// Database/Migrations/create_ppdi_kabupaten_bandung_tables.php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('ref_kecamatan', function (Blueprint $table) {
            $table->string('id_kecamatan', 10)->primary();
            $table->string('nama_kecamatan', 100)->index();
        });

        Schema::create('ref_desa', function (Blueprint $table) {
            $table->string('id_desa', 20)->primary();
            $table->string('id_kecamatan', 10);
            $table->string('nama_desa', 100)->index();
            $table->text('alamat_kantor_desa')->nullable();
            $table->foreign('id_kecamatan')->references('id_kecamatan')->on('ref_kecamatan')->cascadeOnUpdate();
        });

        Schema::create('ref_jabatan', function (Blueprint $table) {
            $table->id('id_jabatan');
            $table->string('nama_jabatan', 100);
            $table->enum('kategori_jabatan', ['Sekretariat', 'Pelaksana Teknis', 'Pelaksana Kewilayahan', 'Kepala Desa'])->index();
        });

        Schema::create('anggota', function (Blueprint $table) {
            $table->uuid('id_anggota')->primary();
            $table->string('nik', 16)->unique();
            $table->string('niap_nipd', 30)->nullable();
            $table->string('nama_lengkap', 150)->index();
            $table->string('gelar_depan', 30)->nullable();
            $table->string('gelar_belakang', 50)->nullable();
            $table->string('tempat_lahir', 100);
            $table->date('tanggal_lahir')->index(); // Evaluasi Pensiun 60 thn
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->string('agama', 30)->default('Islam');
            $table->enum('pendidikan_terakhir', ['SMA/SMK', 'D3', 'S1', 'S2']);
            $table->string('no_hp_wa', 20)->index();
            $table->string('email', 100)->nullable();
            $table->string('foto', 255)->nullable();
            $table->text('alamat_rumah');
            $table->enum('status_pernikahan', ['Kawin', 'Belum Kawin', 'Cerai Hidup', 'Cerai Mati'])->default('Kawin');
            $table->timestamps();
        });

        Schema::create('riwayat_jabatan', function (Blueprint $table) {
            $table->uuid('id_riwayat')->primary();
            $table->foreignUuid('id_anggota')->constrained('anggota')->cascadeOnDelete();
            $table->string('id_desa', 20);
            $table->unsignedBigInteger('id_jabatan');
            $table->string('no_sk_pengangkatan', 100);
            $table->date('tgl_sk_pengangkatan');
            $table->date('tmt_jabatan');
            $table->enum('status_aktif', ['Aktif', 'Purna Tugas', 'Meninggal Dunia', 'Diberhentikan', 'Mutasi'])->default('Aktif')->index();
            $table->string('file_sk', 255)->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->foreign('id_desa')->references('id_desa')->on('ref_desa')->cascadeOnUpdate();
            $table->foreign('id_jabatan')->references('id_jabatan')->on('ref_jabatan')->cascadeOnUpdate();
        });

        Schema::create('keanggotaan_ppdi', function (Blueprint $table) {
            $table->uuid('id_ppdi')->primary();
            $table->foreignUuid('id_anggota')->constrained('anggota')->cascadeOnDelete();
            $table->string('no_kta', 50)->unique();
            $table->date('tgl_bergabung');
            $table->string('jabatan_pengurus', 100)->default('Anggota Biasa');
            $table->enum('status_kta', ['Aktif', 'Pending', 'Non-Aktif'])->default('Aktif')->index();
            $table->timestamps();
        });

        Schema::create('iuran_anggota', function (Blueprint $table) {
            $table->uuid('id_iuran')->primary();
            $table->foreignUuid('id_anggota')->constrained('anggota')->cascadeOnDelete();
            $table->smallInteger('tahun')->index();
            $table->tinyInteger('bulan')->index();
            $table->decimal('jumlah', 12, 2)->default(35000);
            $table->dateTime('tgl_bayar');
            $table->string('bukti_trf', 255)->nullable();
            $table->enum('status_verifikasi', ['Pending', 'Lunas', 'Ditolak'])->default('Pending')->index();
            $table->string('catatan', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('iuran_anggota');
        Schema::dropIfExists('keanggotaan_ppdi');
        Schema::dropIfExists('riwayat_jabatan');
        Schema::dropIfExists('anggota');
        Schema::dropIfExists('ref_jabatan');
        Schema::dropIfExists('ref_desa');
        Schema::dropIfExists('ref_kecamatan');
    }
};
`;

export const CODEIGNITER4_MIGRATION_CODE = `<?php
// app/Database/Migrations/2026-10-14-000001_CreatePpdiSchema.php

namespace App\\Database\\Migrations;

use CodeIgniter\\Database\\Migration;

class CreatePpdiSchema extends Migration {
    public function up() {
        // ref_kecamatan
        $this->forge->addField([
            'id_kecamatan' => ['type' => 'VARCHAR', 'constraint' => 10],
            'nama_kecamatan' => ['type' => 'VARCHAR', 'constraint' => 100],
        ]);
        $this->forge->addKey('id_kecamatan', true);
        $this->forge->createTable('ref_kecamatan', true);

        // ref_desa
        $this->forge->addField([
            'id_desa' => ['type' => 'VARCHAR', 'constraint' => 20],
            'id_kecamatan' => ['type' => 'VARCHAR', 'constraint' => 10],
            'nama_desa' => ['type' => 'VARCHAR', 'constraint' => 100],
            'alamat_kantor_desa' => ['type' => 'TEXT', 'null' => true],
        ]);
        $this->forge->addKey('id_desa', true);
        $this->forge->addForeignKey('id_kecamatan', 'ref_kecamatan', 'id_kecamatan', 'CASCADE', 'RESTRICT');
        $this->forge->createTable('ref_desa', true);

        // ref_jabatan
        $this->forge->addField([
            'id_jabatan' => ['type' => 'INT', 'auto_increment' => true],
            'nama_jabatan' => ['type' => 'VARCHAR', 'constraint' => 100],
            'kategori_jabatan' => ['type' => 'ENUM', 'constraint' => ['Sekretariat', 'Pelaksana Teknis', 'Pelaksana Kewilayahan', 'Kepala Desa']],
        ]);
        $this->forge->addKey('id_jabatan', true);
        $this->forge->createTable('ref_jabatan', true);

        // anggota
        $this->forge->addField([
            'id_anggota' => ['type' => 'VARCHAR', 'constraint' => 36],
            'nik' => ['type' => 'VARCHAR', 'constraint' => 16, 'unique' => true],
            'niap_nipd' => ['type' => 'VARCHAR', 'constraint' => 30, 'null' => true],
            'nama_lengkap' => ['type' => 'VARCHAR', 'constraint' => 150],
            'gelar_depan' => ['type' => 'VARCHAR', 'constraint' => 30, 'null' => true],
            'gelar_belakang' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
            'tempat_lahir' => ['type' => 'VARCHAR', 'constraint' => 100],
            'tanggal_lahir' => ['type' => 'DATE'],
            'jenis_kelamin' => ['type' => 'ENUM', 'constraint' => ['L', 'P']],
            'agama' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'Islam'],
            'pendidikan_terakhir' => ['type' => 'ENUM', 'constraint' => ['SMA/SMK', 'D3', 'S1', 'S2']],
            'no_hp_wa' => ['type' => 'VARCHAR', 'constraint' => 20],
            'email' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'foto' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'alamat_rumah' => ['type' => 'TEXT'],
            'status_pernikahan' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'Kawin'],
            'created_at datetime default current_timestamp',
            'updated_at datetime default current_timestamp on update current_timestamp',
        ]);
        $this->forge->addKey('id_anggota', true);
        $this->forge->createTable('anggota', true);
    }

    public function down() {
        $this->forge->dropTable('anggota', true);
        $this->forge->dropTable('ref_jabatan', true);
        $this->forge->dropTable('ref_desa', true);
        $this->forge->dropTable('ref_kecamatan', true);
    }
}
`;
