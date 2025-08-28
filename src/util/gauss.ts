import type Matrix from "ml-matrix";

// Not my code
export const gfMatrixGaussian = (matrix: Matrix, gf: number) => {
    matrix = matrix.clone();
    const mod = (x: number) => ((x % gf) + gf) % gf;
    
    // Helper functions
    const gcd = (a: number, b: number): number => {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b !== 0) [a, b] = [b, a % b];
        return a;
    };

    const extendedGcd = (a: number, b: number): [number, number, number] => {
        a = Math.abs(a);
        b = Math.abs(b);
        let [x0, x1, y0, y1] = [1, 0, 0, 1];
        while (b !== 0) {
            const q = Math.floor(a / b);
            [a, b] = [b, a % b];
            [x0, x1] = [x1, x0 - q * x1];
            [y0, y1] = [y1, y0 - q * y1];
        }
        return [a, x0, y0];
    };

    const modInverse = (a: number, n: number): number => {
        a = mod(a);
        const [g, x] = extendedGcd(a, n);
        if (g !== 1) throw new Error("Inverse doesn't exist");
        return mod(x);
    };

    const rows = matrix.rows;
    const cols = matrix.columns;
    const pivotInfo: { row: number; col: number; g: number }[] = [];
    let r = 0;

    // Convert to ℤₙ
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            matrix.set(i, j, mod(matrix.get(i, j)));
        }
    }

    // Forward elimination
    for (let c = 0; c < cols && r < rows; c++) {
        // Find best pivot (smallest GCD with gf)
        let bestRow = -1;
        let bestG = gf + 1;
        for (let i = r; i < rows; i++) {
            const elem = matrix.get(i, c);
            if (elem === 0) continue;
            const g = gcd(elem, gf);
            if (g < bestG) {
                bestG = g;
                bestRow = i;
                if (g === 1) break; // Found optimal pivot
            }
        }
        if (bestRow === -1) continue;

        matrix.swapRows(bestRow, r);
        const pivotVal = matrix.get(r, c);
        const gVal = bestG;

        // Normalize invertible pivots
        if (gVal === 1) {
            const inv = modInverse(pivotVal, gf);
            for (let j = c; j < cols; j++) {
                matrix.set(r, j, mod(matrix.get(r, j) * inv));
            }
        }

        // Eliminate below
        for (let i = r + 1; i < rows; i++) {
            const elem = matrix.get(i, c);
            if (elem === 0) continue;

            if (gVal === 1) {
                // Standard elimination for invertible pivot
                const factor = matrix.get(i, c);
                for (let j = c; j < cols; j++) {
                    const val = mod(matrix.get(i, j) - mod(factor * matrix.get(r, j)));
                    matrix.set(i, j, val);
                }
            } else if (elem % gVal === 0) {
                // Special handling for non-invertible pivot
                const p = pivotVal;
                const pPrime = p / gVal;
                const ePrime = elem / gVal;
                const nPrime = gf / gVal;
                try {
                    const k = mod(ePrime * modInverse(pPrime, nPrime));
                    for (let j = c; j < cols; j++) {
                        const val = mod(matrix.get(i, j) - mod(k * matrix.get(r, j)));
                        matrix.set(i, j, val);
                    }
                } catch (e) {
                }
            }
        }

        pivotInfo.push({ row: r, col: c, g: gVal });
        r++;
    }

    // Backward elimination
    pivotInfo.sort((a, b) => b.row - a.row); // Bottom to top
    for (const { row: r0, col: c0, g: g0 } of pivotInfo) {
        for (let i = 0; i < r0; i++) {
            const elem = matrix.get(i, c0);
            if (elem === 0) continue;

            if (g0 === 1) {
                // Standard elimination for invertible pivot
                const factor = matrix.get(i, c0);
                for (let j = c0; j < cols; j++) {
                    const val = mod(matrix.get(i, j) - mod(factor * matrix.get(r0, j)));
                    matrix.set(i, j, val);
                }
            } else if (elem % g0 === 0) {
                // Special handling for non-invertible pivot
                const p0 = matrix.get(r0, c0);
                const pPrime = p0 / g0;
                const ePrime = elem / g0;
                const nPrime = gf / g0;
                try {
                    const k = mod(ePrime * modInverse(pPrime, nPrime));
                    for (let j = c0; j < cols; j++) {
                        const val = mod(matrix.get(i, j) - mod(k * matrix.get(r0, j)));
                        matrix.set(i, j, val);
                    }
                } catch (e) {
                }
            }
        }
    }

    // Final normalization for invertible pivots
    for (const { row: r0, col: c0 } of pivotInfo) {
        const elem = matrix.get(r0, c0);
        if (gcd(elem, gf) === 1) {
            const inv = modInverse(elem, gf);
            for (let j = c0; j < cols; j++) {
                matrix.set(r0, j, mod(matrix.get(r0, j) * inv));
            }
        }
    }

    return matrix;
};