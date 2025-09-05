/**
 * Normalize a path string into an array of absolute segments with explicit commands:
 * M, L, Q, C, Z only. (H/V -> L, T -> Q, S -> C; relative -> absolute)
 */
 export function normalizePath(d) {
   const CMD = /[a-zA-Z]/;
   const NUM = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

   const tokens = [];
   d.replace(NUM, n => { tokens.push(Number(n)); return n; });

   const segs = [];
   let cx = 0, cy = 0, sx = 0, sy = 0;
   let prevQ = null, prevC2 = null;

   const reflect = (px, py, x, y) => [2 * x - px, 2 * y - py];

   let i = 0;
   const take = n => tokens.splice(0, n);

   d.replace(/[a-zA-Z][^a-zA-Z]*/g, chunk => {
     const cmd = chunk[0];
     const nums = (chunk.slice(1).match(NUM) || []).map(Number);
     let k = 0;
     const C = cmd.toUpperCase();
     const isRel = cmd === cmd.toLowerCase();

     const next = n => {
       const out = nums.slice(k, k + n);
       k += n;
       return out;
     };

     const pushM = (x, y) => { segs.push({ type: "M", points: [[x, y]] }); };
     const pushL = (x, y) => { segs.push({ type: "L", points: [[x, y]] }); };
     const pushQ = (c1x, c1y, x, y) =>
       segs.push({ type: "Q", points: [[c1x, c1y], [x, y]] });
     const pushC = (c1x, c1y, c2x, c2y, x, y) =>
       segs.push({ type: "C", points: [[c1x, c1y], [c2x, c2y], [x, y]] });

     if (C === "M") {
       while (k < nums.length) {
         let [x, y] = next(2);
         if (isRel) { x += cx; y += cy; }
         if (!segs.length || segs.at(-1).type === "Z") {
           pushM(x, y); sx = x; sy = y;
         } else {
           pushL(x, y);
         }
         cx = x; cy = y;
         prevQ = prevC2 = null;
       }
     }

     else if (C === "L") {
       while (k < nums.length) {
         let [x, y] = next(2);
         if (isRel) { x += cx; y += cy; }
         pushL(x, y);
         cx = x; cy = y;
         prevQ = prevC2 = null;
       }
     }

     else if (C === "H" || C === "V") {
       while (k < nums.length) {
         let val = next(1)[0];
         if (C === "H") {
           if (isRel) val += cx;
           pushL(val, cy);
           cx = val;
         } else {
           if (isRel) val += cy;
           pushL(cx, val);
           cy = val;
         }
         prevQ = prevC2 = null;
       }
     }

     else if (C === "Q") {
       while (k < nums.length) {
         let [qcx, qcy, x, y] = next(4);
         if (isRel) { qcx += cx; qcy += cy; x += cx; y += cy; }
         pushQ(qcx, qcy, x, y);
         prevQ = [qcx, qcy];
         prevC2 = null;
         cx = x; cy = y;
       }
     }

     else if (C === "T") {
       while (k < nums.length) {
         let [x, y] = next(2);
         if (isRel) { x += cx; y += cy; }
         const [qcx, qcy] = prevQ ? reflect(prevQ[0], prevQ[1], cx, cy) : [cx, cy];
         pushQ(qcx, qcy, x, y);
         prevQ = [qcx, qcy];
         prevC2 = null;
         cx = x; cy = y;
       }
     }

     else if (C === "C") {
       while (k < nums.length) {
         let [c1x, c1y, c2x, c2y, x, y] = next(6);
         if (isRel) { c1x+=cx;c1y+=cy;c2x+=cx;c2y+=cy;x+=cx;y+=cy; }
         pushC(c1x, c1y, c2x, c2y, x, y);
         prevC2 = [c2x, c2y];
         prevQ = null;
         cx = x; cy = y;
       }
     }

     else if (C === "S") {
       while (k < nums.length) {
         let [c2x, c2y, x, y] = next(4);
         if (isRel) { c2x+=cx;c2y+=cy;x+=cx;y+=cy; }
         const [c1x, c1y] = prevC2 ? reflect(prevC2[0], prevC2[1], cx, cy) : [cx, cy];
         pushC(c1x, c1y, c2x, c2y, x, y);
         prevC2 = [c2x, c2y];
         prevQ = null;
         cx = x; cy = y;
       }
     }

     else if (C === "Z") {
       segs.push({ type: "Z", points: [] });
       cx = sx; cy = sy;
       prevQ = prevC2 = null;
     }

     else {
       segs.push({ type: "RAW", raw: chunk });
       prevQ = prevC2 = null;
     }
   });

   return segs;
 }

// Build back to string
export function buildPath(segs) {
  const parts = [];
  const f = n => +n.toFixed(2); // number instead of string concat
  for (const s of segs) {
    switch (s.type) {
      case "M":
      case "L": {
        const [p] = s.points;
        parts.push(`${s.type} ${f(p[0])} ${f(p[1])}`);
        break;
      }
      case "Q": {
        const [c, e] = s.points;
        parts.push(`Q ${f(c[0])} ${f(c[1])} ${f(e[0])} ${f(e[1])}`);
        break;
      }
      case "C": {
        const [c1, c2, e] = s.points;
        parts.push(`C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(e[0])} ${f(e[1])}`);
        break;
      }
      case "Z": parts.push("Z"); break;
      case "RAW": parts.push(s.raw); break;
    }
  }
  return parts.join(" ");
}
