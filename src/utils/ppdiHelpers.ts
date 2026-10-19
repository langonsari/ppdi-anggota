import { Anggota, RiwayatJabatan, KeanggotaanPPDI, RefDesa, RefKecamatan, RefJabatan, AnggotaFullDetail, IuranAnggota } from '../types/ppdi';

// Reference date for 2026-10-14
const TODAY = new Date('2026-10-14T00:00:00Z');

export function calculateAgeAndRetirement(birthDateStr: string): {
  usia: number;
  sisaTahun: number;
  sisaBulan: number;
  statusPensiun: 'Aman' | 'Waspada (<2 Thn)' | 'Siaga (<1 Thn)' | 'Kritis (<6 Bln)' | 'Sudah Purna Tugas';
  tanggalPurnaTugas: string;
} {
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) {
    return {
      usia: 0,
      sisaTahun: 60,
      sisaBulan: 720,
      statusPensiun: 'Aman',
      tanggalPurnaTugas: '-',
    };
  }

  // Usia pensiun perangkat desa sesuai regulasi UU Desa adalah 60 tahun
  const retirementDate = new Date(birthDate);
  retirementDate.setFullYear(birthDate.getFullYear() + 60);

  // Age calculation
  let age = TODAY.getFullYear() - birthDate.getFullYear();
  const m = TODAY.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && TODAY.getDate() < birthDate.getDate())) {
    age--;
  }

  // Difference in months to retirement
  const totalMonthsDiff =
    (retirementDate.getFullYear() - TODAY.getFullYear()) * 12 +
    (retirementDate.getMonth() - TODAY.getMonth());

  const sisaTahun = Math.max(0, Math.floor(totalMonthsDiff / 12));
  const sisaBulan = Math.max(0, totalMonthsDiff);

  let statusPensiun: 'Aman' | 'Waspada (<2 Thn)' | 'Siaga (<1 Thn)' | 'Kritis (<6 Bln)' | 'Sudah Purna Tugas';

  if (TODAY >= retirementDate || totalMonthsDiff <= 0) {
    statusPensiun = 'Sudah Purna Tugas';
  } else if (totalMonthsDiff <= 6) {
    statusPensiun = 'Kritis (<6 Bln)';
  } else if (totalMonthsDiff <= 12) {
    statusPensiun = 'Siaga (<1 Thn)';
  } else if (totalMonthsDiff <= 24) {
    statusPensiun = 'Waspada (<2 Thn)';
  } else {
    statusPensiun = 'Aman';
  }

  const tanggalPurnaTugas = retirementDate.toISOString().split('T')[0];

  return {
    usia: Math.max(0, age),
    sisaTahun,
    sisaBulan,
    statusPensiun,
    tanggalPurnaTugas,
  };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const parts = dateStr.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
        }
        return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
      }
      return dateStr;
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      // If already YYYY-MM-DD or similar
      const parts = dateStr.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD -> DD/MM/YYYY
          return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
        }
        return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
      }
      return dateStr;
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function formatNamaLengkap(anggota: { nama_lengkap: string; gelar_depan?: string; gelar_belakang?: string }): string {
  const front = anggota.gelar_depan ? `${anggota.gelar_depan} ` : '';
  const name = (anggota.nama_lengkap || '').toUpperCase();
  const back = anggota.gelar_belakang ? `, ${anggota.gelar_belakang}` : '';
  return `${front}${name}${back}`;
}

export function buildFullMember(
  anggota: Anggota,
  riwayatList: RiwayatJabatan[],
  keanggotaanList: KeanggotaanPPDI[],
  desaList: RefDesa[],
  kecamatanList: RefKecamatan[],
  jabatanList: RefJabatan[],
  iuranList: IuranAnggota[]
): AnggotaFullDetail {
  // Ensure nama_lengkap is always uppercase
  const upperAnggota: Anggota = {
    ...anggota,
    nama_lengkap: (anggota.nama_lengkap || '').toUpperCase(),
  };

  // Find latest or active riwayat
  const riwayats = riwayatList.filter(
    (r) => String(r.id_anggota).toLowerCase() === String(upperAnggota.id_anggota).toLowerCase()
  );
  const activeRiwayat = riwayats.find((r) => r.status_aktif === 'Aktif') || riwayats[0];

  const cleanRiwayatDesa = activeRiwayat ? String(activeRiwayat.id_desa || '').replace(/\./g, '').trim() : '';
  const foundDesa = activeRiwayat
    ? desaList.find(
        (d) =>
          d.id_desa === activeRiwayat.id_desa ||
          String(d.id_desa || '').replace(/\./g, '').trim() === cleanRiwayatDesa
      )
    : undefined;

  const cleanDesaKec = foundDesa
    ? String(foundDesa.id_kecamatan || '').replace(/\./g, '').trim()
    : (cleanRiwayatDesa.length >= 6 ? cleanRiwayatDesa.slice(0, 6) : '');

  const kecamatan = (foundDesa || cleanDesaKec)
    ? kecamatanList.find(
        (k) =>
          (foundDesa && k.id_kecamatan === foundDesa.id_kecamatan) ||
          String(k.id_kecamatan || '').replace(/\./g, '').trim() === cleanDesaKec
      )
    : undefined;

  const desa: RefDesa | undefined = foundDesa || (activeRiwayat?.id_desa ? {
    id_desa: activeRiwayat.id_desa,
    id_kecamatan: cleanDesaKec,
    nama_desa: `Desa ${cleanRiwayatDesa.slice(-4) || cleanRiwayatDesa}`,
    alamat_kantor_desa: '-',
  } : undefined);

  const jabatanRef: RefJabatan | undefined = activeRiwayat
    ? (jabatanList.find((j) => Number(j.id_jabatan) === Number(activeRiwayat.id_jabatan)) || {
        id_jabatan: Number(activeRiwayat.id_jabatan) || 1,
        nama_jabatan: 'Perangkat Desa',
        kategori_jabatan: 'Pelaksana Teknis',
      })
    : undefined;

  const keanggotaan = keanggotaanList.find(
    (k) => String(k.id_anggota).toLowerCase() === String(upperAnggota.id_anggota).toLowerCase()
  );

  const retirement = calculateAgeAndRetirement(upperAnggota.tanggal_lahir);

  const totalIuranLunas = iuranList
    .filter((i) => i.id_anggota === upperAnggota.id_anggota && i.status_verifikasi === 'Lunas')
    .reduce((sum, item) => sum + item.jumlah, 0);

  return {
    anggota: upperAnggota,
    jabatanTerkini: activeRiwayat,
    desa,
    kecamatan,
    jabatanRef,
    keanggotaan,
    usia: retirement.usia,
    sisaMasaPensiunTahun: retirement.sisaTahun,
    sisaMasaPensiunBulan: retirement.sisaBulan,
    statusPensiun: activeRiwayat?.status_aktif === 'Purna Tugas' ? 'Sudah Purna Tugas' : retirement.statusPensiun,
    totalIuranLunas,
  };
}

export function generateNextKTA(
  idKecamatan: string,
  idDesa: string,
  existingList: KeanggotaanPPDI[]
): string {
  // Pattern: 32.04.[KodeKec 2 digit].[KodeDesa 4 digit].[NoUrut 4 digit]
  let kecCode = '00';
  if (idKecamatan) {
    const cleanKec = idKecamatan.replace(/\./g, '').trim();
    if (cleanKec.length >= 6) {
      kecCode = cleanKec.slice(4, 6);
    } else if (cleanKec.length >= 2) {
      kecCode = cleanKec.slice(-2);
    } else {
      kecCode = cleanKec.padStart(2, '0');
    }
  }

  let desaCode = '0000';
  if (idDesa) {
    const cleanDesa = idDesa.replace(/\./g, '').trim();
    if (cleanDesa.length >= 10) {
      desaCode = cleanDesa.slice(6, 10);
    } else if (cleanDesa.length >= 4) {
      desaCode = cleanDesa.slice(-4);
    } else {
      desaCode = cleanDesa.padStart(4, '0');
    }
  }

  const count = existingList.length + 1;
  const numStr = String(count).padStart(4, '0');
  return `32.04.${kecCode}.${desaCode}.${numStr}`;
}

/**
 * Safe fetch wrapper that handles HTML responses, network errors, and JSON parse failures.
 * Prevents "Unexpected token '<', '<!doctype '... is not valid JSON" errors completely.
 */
export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T & { success?: boolean; message?: string; error?: string }; error?: string }> {
  try {
    const res = await fetch(input, init);
    const text = await res.text();

    if (!text || !text.trim()) {
      return { ok: res.ok, status: res.status, data: { success: res.ok } as any };
    }

    // Check if the response returned an HTML document instead of JSON
    const trimmed = text.trim();
    if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.startsWith('<')) {
      const isNotFound = res.status === 404;
      const isGatewayError = res.status === 502 || res.status === 503 || res.status === 504;
      let errorMsg = `Server hosting mengembalikan halaman HTML (Status ${res.status}).`;
      if (isNotFound) {
        errorMsg = `Endpoint API tidak ditemukan (404). Server backend kemungkinan belum mengaktifkan route ini.`;
      } else if (isGatewayError) {
        errorMsg = `Server hosting tidak dapat dijangkau (Gateway Error ${res.status}). Pastikan service Node.js sedang berjalan di cPanel.`;
      } else {
        errorMsg = `Server hosting mengembalikan halaman web (HTML, status ${res.status}) bukannya data JSON. Pastikan aplikasi Node.js (server.js) berjalan di hosting.`;
      }
      return {
        ok: false,
        status: res.status,
        data: { success: false, error: errorMsg, message: errorMsg } as any,
        error: errorMsg,
      };
    }

    try {
      const data = JSON.parse(text);
      return { ok: res.ok, status: res.status, data };
    } catch (parseErr: any) {
      const errorMsg = `Format respons dari server tidak valid JSON: ${parseErr.message}`;
      return {
        ok: false,
        status: res.status,
        data: { success: false, error: errorMsg, message: errorMsg } as any,
        error: errorMsg,
      };
    }
  } catch (netErr: any) {
    const errorMsg = netErr.message || 'Koneksi jaringan ke server gagal';
    return {
      ok: false,
      status: 0,
      data: { success: false, error: errorMsg, message: errorMsg } as any,
      error: errorMsg,
    };
  }
}

/**
 * Safe parser for Response objects to prevent Unexpected token '<' errors
 */
export async function safeResponseJson<T = any>(
  res: Response
): Promise<{ ok: boolean; status: number; data: T & { success?: boolean; message?: string; error?: string }; error?: string }> {
  try {
    const text = await res.text();
    if (!text || !text.trim()) {
      return { ok: res.ok, status: res.status, data: { success: res.ok } as any };
    }
    const trimmed = text.trim();
    if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.startsWith('<')) {
      const errorMsg = `Server mengembalikan halaman HTML (Status ${res.status}) bukannya data JSON.`;
      return {
        ok: false,
        status: res.status,
        data: { success: false, error: errorMsg, message: errorMsg } as any,
        error: errorMsg,
      };
    }
    const data = JSON.parse(text);
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    const errorMsg = `Format JSON tidak valid: ${err.message}`;
    return {
      ok: false,
      status: res.status,
      data: { success: false, error: errorMsg, message: errorMsg } as any,
      error: errorMsg,
    };
  }
}

