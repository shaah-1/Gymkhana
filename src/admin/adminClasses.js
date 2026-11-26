export const ADMIN_SERIF_FONT =
  "font-['Bodoni_72','Bodoni_72_Oldstyle','Didot','Bodoni_Moda','Cormorant_Garamond','Bodoni_MT','Cinzel',Georgia,serif]";

export const adminBreadcrumbsClass =
  "mb-[22px] flex items-center gap-2 text-[11px] tracking-[0.04em] text-[#8e9096]";

export const adminBreadcrumbLinkClass =
  "text-[#8e9096] no-underline transition-colors duration-150 hover:text-[#121214]";

export const adminPageHeaderClass =
  "mb-8 flex items-end justify-between gap-5 max-[640px]:mb-6 max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:gap-[14px]";

export const adminPageTitleClass =
  `${ADMIN_SERIF_FONT} m-0 text-[clamp(34px,4.5vw,48px)] leading-[1.1] font-normal tracking-[0.08em] text-[#121214] uppercase max-[768px]:text-[clamp(26px,5.5vw,36px)] max-[640px]:mb-1 max-[640px]:text-[clamp(22px,5.2vw,30px)] max-[640px]:leading-[1.15]`;

export const adminPageSubtitleClass = "mt-[6px] mb-0 text-[12.5px] text-[#6f7177]";

export const adminTitleNumClass =
  "align-[0.04em] text-[0.82em] font-light tracking-[0.02em] text-[#121214] [font-feature-settings:'lnum'_1,'tnum'_1] tabular-nums";

export const adminNumClass =
  "text-[13px] font-light tracking-[0.01em] text-[#121214] [font-feature-settings:'lnum'_1,'tnum'_1] tabular-nums";

export const adminSearchWrapClass =
  "mb-6 w-full max-w-[340px] max-[640px]:mb-4 max-[640px]:max-w-full";

export const adminUnderlineInputClass =
  "w-full rounded-none border-0 border-b border-[#d4d5d9] bg-transparent py-[10px] font-inherit text-[13px] text-[#121214] outline-none transition-colors duration-200 placeholder:font-light placeholder:text-[#a4a6ad] focus:border-b-[#121214]";

export const adminFieldLabelClass =
  "mb-1 text-[10.5px] font-semibold tracking-[0.14em] text-[#7a7c82] uppercase";

export const adminBtnBlackClass =
  "inline-flex cursor-pointer items-center justify-center gap-[10px] rounded-none border border-[#121214] bg-[#121214] px-[34px] py-[14px] font-inherit text-[11px] font-semibold tracking-[0.22em] text-white uppercase no-underline transition-all duration-200 hover:bg-white hover:text-[#121214] disabled:cursor-not-allowed disabled:opacity-60 max-[640px]:box-border max-[640px]:w-full max-[640px]:px-[18px] max-[640px]:py-3 max-[640px]:text-[10.5px] max-[480px]:px-[18px] max-[480px]:py-[11px] max-[480px]:text-[10px] max-[480px]:tracking-[0.14em]";

export const adminBtnOutlineClass =
  "inline-flex cursor-pointer items-center justify-center gap-[10px] rounded-none border border-[#d4d5d9] bg-transparent px-7 py-[13px] font-inherit text-[11px] font-semibold tracking-[0.18em] text-[#121214] uppercase no-underline transition-all duration-200 hover:border-[#121214] hover:bg-[#f7f7f8] max-[640px]:box-border max-[640px]:w-full max-[640px]:px-[18px] max-[640px]:py-3 max-[640px]:text-[10.5px] max-[480px]:px-[18px] max-[480px]:py-[11px] max-[480px]:text-[10px] max-[480px]:tracking-[0.14em]";

export const adminErrorNoticeClass =
  "mb-5 border border-[#d4a5a5] bg-[#fdf5f5] px-[14px] py-[10px] text-[11.5px] tracking-[0.02em] text-[#8c3b3b]";

export const adminTableContainerClass =
  "overflow-x-auto border border-[#e6e6e9] bg-white max-[768px]:-mx-4 max-[768px]:rounded-none max-[768px]:border-x-0 max-[480px]:-mx-3";

export const adminTableClass =
  "w-full border-collapse text-left max-[768px]:min-w-[580px] max-[380px]:min-w-[520px]";

export const adminThClass =
  "border-b border-[#e6e6e9] bg-[#f7f7f9] px-4 py-3 text-[10px] font-bold tracking-[0.16em] whitespace-nowrap text-[#5f6168] uppercase max-[768px]:px-3 max-[768px]:py-[10px] max-[768px]:text-[11.5px] max-[480px]:px-[10px] max-[480px]:py-[9px] max-[480px]:text-[11px]";

export const adminTdClass =
  "border-b border-[#f0f0f3] px-4 py-[14px] align-middle text-xs text-[#2b2c30] group-last/row:border-b-0 max-[768px]:px-3 max-[768px]:py-[10px] max-[768px]:text-[11.5px] max-[480px]:px-[10px] max-[480px]:py-[9px] max-[480px]:text-[11px]";

export const adminFormContainerClass =
  "max-w-[840px] border border-[#e6e6e9] bg-white p-[clamp(24px,4vw,44px)] max-[640px]:px-[14px] max-[640px]:py-5 max-[380px]:px-[10px] max-[380px]:py-[14px]";

export const adminBackLinkClass =
  "inline-flex items-center gap-[6px] text-[11px] font-semibold tracking-[0.14em] text-[#6f7177] uppercase no-underline transition-colors duration-150 hover:text-[#121214]";

export const adminThumbBoxClass =
  "box-border grid h-11 w-11 shrink-0 place-items-center border border-[#e6e6e9] bg-[#f5f5f7] p-1";

export const ADMIN_STATUS_COLOR = {
  delivered: "text-[#16a34a]",
  active: "text-[#16a34a]",
  "in-stock": "text-[#16a34a]",
  optimal: "text-[#16a34a]",
  processing: "text-[#2563eb]",
  shipped: "text-[#0284c7]",
  pending: "text-[#d97706]",
  attention: "text-[#d97706]",
  "low-stock": "text-[#d97706]",
  cancelled: "text-[#dc2626]",
  blocked: "text-[#dc2626]",
  "out-of-stock": "text-[#dc2626]",
  critical: "text-[#dc2626]",
};

export function adminStatusTagClass(statusKey) {
  return `box-border inline-flex w-auto min-w-0 items-center justify-start gap-[5px] rounded-none border-0 bg-transparent p-0 text-left font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[10px] leading-[1.2] font-bold tracking-[0.1em] whitespace-nowrap uppercase tabular-nums max-[640px]:text-[8.5px] max-[640px]:tracking-[0.08em] ${
    ADMIN_STATUS_COLOR[statusKey] || "text-[#d97706]"
  }`;
}
