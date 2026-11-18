export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

export const IDENTITY_LABELS = {
  student: { bn: 'বর্তমান শিক্ষার্থী', short: 'শিক্ষার্থী', badgeTop: 'বর্তমান', badgeBottom: 'শিক্ষার্থী' },
  alumni: { bn: 'প্রাক্তন শিক্ষার্থী', short: 'প্রাক্তন', badgeTop: 'প্রাক্তন', badgeBottom: 'শিক্ষার্থী' },
  future: { bn: 'ভবিষ্যৎ পরিকল্পনা', short: 'স্বপ্নবাজ', badgeTop: 'ভবিষ্যৎ', badgeBottom: 'পরিকল্পনা' },
  teacher: { bn: 'সম্মানিত শিক্ষক', short: 'শিক্ষক', badgeTop: 'শ্রদ্ধেয়', badgeBottom: 'শিক্ষক' },
  staff: { bn: 'কর্মকর্তা / কর্মচারী', short: 'কর্মকর্তা', badgeTop: 'কর্মকর্তা /', badgeBottom: 'কর্মচারী' },
};

export const FUTURE_PLAN_LABELS = {
  'Higher Education': 'উচ্চশিক্ষা (Higher Education)',
  'Government Job': 'সরকারি চাকরি (Govt. Job)',
  'Private Job': 'বেসরকারি চাকরি (Private Job)',
  Entrepreneurship: 'উদ্যোক্তা (Entrepreneurship)',
  'Study Abroad': 'বিদেশে উচ্চশিক্ষা (Study Abroad)',
  Research: 'গবেষণা (Research)',
  Other: 'অন্যান্য (Other)',
};

const imageCache = new Map();

export function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src));
  return new Promise((resolve) => {
    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      if (!src.startsWith('blob:')) imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function getWrappedLines(ctx, text, maxWidth, maxLines = 3) {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = test;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

function drawDefaultCollegeCrest(ctx, cx, cy, radius) {
  ctx.save();
  // Outer Emerald Ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = radius * 0.1;
  ctx.strokeStyle = '#047857';
  ctx.stroke();

  // Inner Red Ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2);
  ctx.lineWidth = radius * 0.04;
  ctx.strokeStyle = '#dc2626';
  ctx.stroke();

  // Open Book Graphic
  ctx.fillStyle = '#065f46';
  ctx.beginPath();
  ctx.moveTo(cx, cy - radius * 0.08);
  ctx.quadraticCurveTo(cx - radius * 0.28, cy - radius * 0.24, cx - radius * 0.44, cy - radius * 0.08);
  ctx.lineTo(cx - radius * 0.44, cy + radius * 0.25);
  ctx.quadraticCurveTo(cx - radius * 0.24, cy + radius * 0.14, cx, cy + radius * 0.28);
  ctx.quadraticCurveTo(cx + radius * 0.24, cy + radius * 0.14, cx + radius * 0.44, cy + radius * 0.25);
  ctx.lineTo(cx + radius * 0.44, cy - radius * 0.08);
  ctx.quadraticCurveTo(cx + radius * 0.28, cy - radius * 0.24, cx, cy - radius * 0.08);
  ctx.fill();

  // Red Flame / Star Accent above book
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(cx, cy - radius * 0.36, radius * 0.11, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#047857';
  ctx.font = `700 ${Math.round(radius * 0.24)}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TGC 1972', cx, cy + radius * 0.52);
  ctx.restore();
}

async function drawLogo(ctx, logoUrl, cx, cy, radius) {
  const logoImg = await loadImage(logoUrl);
  if (!logoImg) {
    drawDefaultCollegeCrest(ctx, cx, cy, radius);
    return;
  }
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.clip();
  const scale = Math.min((radius * 1.8) / logoImg.width, (radius * 1.8) / logoImg.height);
  const w = logoImg.width * scale;
  const h = logoImg.height * scale;
  ctx.drawImage(logoImg, cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
}

function drawCircularPortrait(ctx, photoImg, crop, cx, cy, radius, ringColor = '#ffffff', accentRing = '#dc2626') {
  ctx.save();
  // Soft shadow
  ctx.shadowColor = 'rgba(6, 78, 59, 0.24)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 12, 0, Math.PI * 2);
  ctx.fillStyle = ringColor;
  ctx.fill();
  ctx.restore();

  // Accent outer arc
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 16, -Math.PI * 0.15, Math.PI * 0.65);
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.strokeStyle = accentRing;
  ctx.stroke();
  ctx.restore();

  // Clipped image
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  if (photoImg) {
    const coverScale = Math.max((radius * 2) / photoImg.width, (radius * 2) / photoImg.height);
    const zoom = crop?.zoom || 1;
    const drawW = photoImg.width * coverScale * zoom;
    const drawH = photoImg.height * coverScale * zoom;
    const offsetX = ((crop?.offsetX || 0) / 100) * radius;
    const offsetY = ((crop?.offsetY || 0) / 100) * radius;
    ctx.drawImage(photoImg, cx - drawW / 2 + offsetX, cy - drawH / 2 + offsetY, drawW, drawH);
  } else {
    // Elegant placeholder avatar
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(cx, cy - radius * 0.18, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy + radius * 0.68, radius * 0.55, Math.PI, 0);
    ctx.fill();
  }
  ctx.restore();
}

function drawCircularIdentityBadge(ctx, identityType, cx, cy, radius, bg = '#dc2626', border = '#ffffff') {
  const info = IDENTITY_LABELS[identityType] || IDENTITY_LABELS.student;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.22)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = border;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 11, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(radius * 0.3)}px "Hind Siliguri", "Noto Sans Bengali", sans-serif`;
  ctx.fillText(info.badgeTop, cx, cy - radius * 0.18);
  ctx.fillText(info.badgeBottom, cx, cy + radius * 0.2);
  ctx.restore();
}

function buildInfoLines(data, visibility) {
  const items = [];
  const type = data.identityType || 'student';

  if (type === 'teacher') {
    if (data.designation) items.push({ label: 'পদবি', value: data.designation });
    if (data.department) items.push({ label: 'বিভাগ', value: data.department });
    if (data.workplace) items.push({ label: 'কর্মস্থল', value: data.workplace });
  } else if (type === 'staff') {
    if (data.designation) items.push({ label: 'পদবি', value: data.designation });
    if (data.department) items.push({ label: 'শাখা / বিভাগ', value: data.department });
  } else {
    if (data.department) items.push({ label: 'বিভাগ', value: data.department });
    if (visibility.showSession && data.session) items.push({ label: 'সেশন', value: data.session });

    if (type === 'student' && visibility.showAcademicDetail) {
      const academic = [data.studyLevel, data.academicYear].filter(Boolean).join(' • ');
      if (academic) items.push({ label: 'অধ্যয়নরত', value: academic });
    }

    if (type === 'alumni') {
      if (visibility.showAcademicDetail && data.passingYear) {
        items.push({ label: 'পাসের সন', value: data.passingYear });
      }
      if (visibility.showProfessionOrGoal && (data.profession || data.workplace)) {
        const prof = [data.profession, data.workplace].filter(Boolean).join(', ');
        items.push({ label: 'পেশা', value: prof });
      }
    }

    if (type === 'future') {
      if (visibility.showAcademicDetail && data.futurePlan) {
        items.push({ label: 'ভবিষ্যৎ পরিকল্পনা', value: FUTURE_PLAN_LABELS[data.futurePlan] || data.futurePlan });
      }
      if (visibility.showProfessionOrGoal && data.careerGoal) {
        items.push({ label: 'লক্ষ্য', value: data.careerGoal });
      }
    }
  }
  return items;
}

function drawDetailPills(ctx, items, x, startY, width, theme = 'light') {
  let y = startY;
  const pillH = 54;
  const gap = 14;
  for (const item of items.slice(0, 4)) {
    ctx.save();
    drawRoundedRect(ctx, x, y, width, pillH, 16);
    ctx.fillStyle = theme === 'dark' ? 'rgba(255,255,255,0.14)' : '#f3f4f6';
    ctx.fill();
    ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.22)' : '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Left emerald accent bar
    drawRoundedRect(ctx, x + 10, y + 11, 7, pillH - 22, 4);
    ctx.fillStyle = theme === 'dark' ? '#34d399' : '#059669';
    ctx.fill();

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = `600 24px "Hind Siliguri", "Noto Sans Bengali", sans-serif`;
    ctx.fillStyle = theme === 'dark' ? '#a7f3d0' : '#047857';
    const labelText = `${item.label}: `;
    ctx.fillText(labelText, x + 32, y + pillH / 2);

    const labelW = ctx.measureText(labelText).width;
    ctx.font = `700 25px "Hind Siliguri", "Noto Sans Bengali", sans-serif`;
    ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#111827';
    let val = item.value;
    const maxValW = width - 48 - labelW;
    while (ctx.measureText(val).width > maxValW && val.length > 4) {
      val = `${val.slice(0, -2)}…`;
    }
    ctx.fillText(val, x + 32 + labelW, y + pillH / 2);
    ctx.restore();
    y += pillH + gap;
  }
  return y;
}

export async function renderPrideCard(canvas, data, settings, visibility = {}) {
  if (!canvas) return;
  await document.fonts.ready;
  try {
    await Promise.all([
      document.fonts.load('700 42px "Hind Siliguri"'),
      document.fonts.load('600 26px "Noto Sans Bengali"'),
    ]);
  } catch {
    // Fallback gracefully if font face API throws
  }

  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');

  const vis = {
    showSession: visibility.showSession !== false,
    showAcademicDetail: visibility.showAcademicDetail !== false,
    showProfessionOrGoal: visibility.showProfessionOrGoal !== false,
    showBio: visibility.showBio !== false,
  };

  const photoImg = await loadImage(data.photoDataUrl);
  const templateId = data.templateId || 'emerald-wave';
  const collegeBn = settings?.collegeNameBn || 'টঙ্গী সরকারি কলেজ';
  const collegeEn = settings?.collegeNameEn || 'TONGI GOVT. COLLEGE • EST. 1972';
  const tagline = settings?.tagline || 'আমি গর্বিত, আমি টঙ্গী সরকারি কলেজ';
  const displayName = (data.fullName || 'আপনার নাম এখানে').trim();
  const items = buildInfoLines(data, vis);
  const bio = vis.showBio && data.publicBio ? data.publicBio.trim() : '';

  ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // =========================================================================
  // TEMPLATE 1: EMERALD CLASSIC WA