export const STYLES = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
@keyframes ppFade{from{opacity:0}to{opacity:1}}
@keyframes ppUp{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:none}}
@keyframes ppSpin{to{transform:rotate(360deg)}}

.pp-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;padding:16px;animation:ppFade .2s ease}
.pp-box{background:#fff;border-radius:22px;width:100%;max-width:500px;max-height:92vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.35);animation:ppUp .32s cubic-bezier(.34,1.56,.64,1)}

.pp-head{padding:18px 20px;display:flex;align-items:center;gap:12px}
.pp-htitle{color:#fff;font-size:19px;font-weight:800;letter-spacing:-.3px}
.pp-hsub{color:rgba(255,255,255,.75);font-size:12px;margin-top:2px}
.pp-x{margin-left:auto;background:rgba(255,255,255,.2);border:none;color:white;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s}
.pp-x:hover{background:rgba(255,255,255,.35)}

.pp-tabs{display:flex;border-bottom:2px solid #f0f0f0}
.pp-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:13px 8px;background:none;border:none;cursor:pointer;font-size:14px;font-weight:700;color:#999;border-bottom:3px solid transparent;margin-bottom:-2px;transition:all .2s;font-family:inherit}
.pp-tab.active{color:#E63946;border-bottom-color:#E63946}
.pp-tab:hover:not(.active){color:#444;background:#fafafa}

.pp-body{flex:1;overflow-y:auto;padding:18px 20px}
.pp-section{display:flex;flex-direction:column;gap:10px}
.pp-lbl{font-size:14px;font-weight:700;color:#333;display:block}

/* Label row: label + locate button */
.pp-label-row{display:flex;justify-content:space-between;align-items:center;gap:8px}

/* Locate button */
.pp-locate-btn{display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:20px;border:1.5px solid #E63946;background:#fff8f8;color:#E63946;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;font-family:inherit;white-space:nowrap;flex-shrink:0}
.pp-locate-btn:hover:not(:disabled){background:#E63946;color:#fff}
.pp-locate-btn:disabled{opacity:.6;cursor:not-allowed}

/* Warnings */
.pp-warn{background:#fff8e1;border:1.5px solid #ffe082;border-radius:10px;padding:10px 13px;font-size:12.5px;color:#795548;line-height:1.5}
.pp-warn-err{background:#fff0f0;border-color:#ffcdd2;color:#c62828}

.pp-field{border:2px solid #e0e0e0;border-radius:12px;background:#fafafa;display:flex;align-items:center;transition:border-color .2s}
.pp-field:focus-within{border-color:#E63946;background:#fff}
.pp-ficon{padding:0 12px;font-size:15px;flex-shrink:0;display:flex;align-items:center;min-width:40px}
.pp-input{flex:1;border:none;background:transparent;padding:13px 0;font-size:14px;color:#222;outline:none;font-family:inherit}
.pp-input::placeholder{color:#bbb}
.pp-clr{background:none;border:none;cursor:pointer;padding:0 14px;color:#bbb;font-size:14px;transition:color .2s}
.pp-clr:hover{color:#E63946}
.pp-spin{width:14px;height:14px;border:2px solid #eee;border-top-color:#E63946;border-radius:50%;display:inline-block;animation:ppSpin .7s linear infinite}

.pp-drop{position:absolute;top:calc(100% + 6px);left:0;right:0;background:#fff;border:2px solid #E6394640;border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.12);z-index:9999;list-style:none;overflow:hidden;max-height:220px;overflow-y:auto}
.pp-drop-item{display:flex;align-items:flex-start;gap:10px;padding:11px 14px;cursor:pointer;transition:background .15s;border-bottom:1px solid #f5f5f5}
.pp-drop-item:last-child{border-bottom:none}
.pp-drop-item:hover{background:#fff8f8}
.pp-drop-pin{font-size:14px;flex-shrink:0;margin-top:1px}
.pp-drop-txt{font-size:14px;color:#333;line-height:1.4}
.pp-empty{position:absolute;top:calc(100% + 6px);left:0;right:0;background:#fff;border:2px solid #f0f0f0;border-radius:14px;padding:14px 16px;font-size:14px;color:#999;text-align:center;z-index:9999}

/* Bảng phí */
.pp-tier-table{background:#fafafa;border:1.5px solid #eee;border-radius:12px;overflow:hidden}
.pp-tier-title{padding:9px 14px;font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #eee;background:#f5f5f5}
.pp-tier-row{display:flex;justify-content:space-between;align-items:center;padding:9px 14px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#555;transition:background .15s}
.pp-tier-row:last-child{border-bottom:none}
.pp-tier-row.active{background:#fff3f3;color:#c1121f;font-weight:700}
.pp-no-ship{color:#bbb;font-weight:400}

/* Kết quả */
.pp-result{border-radius:14px;overflow:hidden;border:2px solid;animation:ppUp .25s ease}
.pp-result.ok{border-color:#E6394940;background:#fff8f8}
.pp-result.no{border-color:#ff990040;background:#fffaf0}
.pp-result-addr{display:flex;align-items:flex-start;gap:12px;padding:13px 15px;border-bottom:1px solid rgba(0,0,0,.06)}
.pp-result-addr span{font-size:22px;flex-shrink:0}
.pp-result-label{font-size:12px;color:#E63946;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
.pp-result-val{font-size:14px;color:#333;line-height:1.4}
.pp-result-row{display:flex;justify-content:space-between;align-items:center;padding:8px 15px;font-size:14px;color:#555;border-bottom:1px solid rgba(0,0,0,.04)}
.pp-result-row:last-child{border-bottom:none}
.pp-result-strong{font-weight:700;color:#222}
.pp-result-fee-row{padding-top:10px;padding-bottom:10px}
.pp-fee-badge{background:#E63946;color:white;font-size:14px;font-weight:800;padding:4px 12px;border-radius:20px}
.pp-no-badge{background:#ff9900;color:white;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px}
.pp-out-of-range{padding:10px 15px;font-size:12px;color:#996600;background:#fff3cd;border-top:1px solid #ffe8a0;line-height:1.5}

/* Map & branches */
.pp-map{height:230px;border-radius:14px;overflow:hidden;border:2px solid #e8e8e8;background:#f0f0f0}
.pp-branches{display:flex;flex-direction:column;gap:8px}
.pp-branch{display:flex;align-items:flex-start;gap:12px;background:#fafafa;border:2px solid #e8e8e8;border-radius:12px;padding:13px 15px;cursor:pointer;text-align:left;width:100%;transition:all .2s;font-family:inherit}
.pp-branch:hover{border-color:#E6394660;background:#fff8f8}
.pp-branch.sel{border-color:#E63946;background:#fff8f8;box-shadow:0 0 0 3px rgba(230,57,70,.1)}
.pp-radio{font-size:18px;flex-shrink:0;margin-top:2px;color:#E63946}
.pp-bname{font-size:14px;font-weight:800;color:#222;margin-bottom:3px}
.pp-baddr{font-size:12px;color:#555;line-height:1.4;margin-bottom:4px}
.pp-bmeta{font-size:12px;color:#888}

/* Footer */
.pp-foot{padding:14px 20px 18px;display:flex;gap:10px;border-top:1px solid #f0f0f0;background:#fff}
.pp-confirm.on{cursor:pointer}
.pp-confirm.ok{background:linear-gradient(135deg,#2a9d2a,#1a6b1a)!important}

@media(max-width:480px){
  .pp-box{border-radius:18px}
  .pp-head,.pp-body,.pp-foot{padding-left:16px;padding-right:16px}
  .pp-map{height:190px}
  .pp-tab{font-size:12px;padding:12px 6px}
  .pp-confirm{font-size:12px}
  .pp-locate-btn{font-size:12px;padding:5px 10px}
}
`;