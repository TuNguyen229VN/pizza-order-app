export function getCommonPrefix(names) {
    if (!names || names.length === 0) return null;
    if (names.length === 1) return names[0];

    // Tách từng tên thành mảng từ (lowercase để so sánh)
    const tokenized = names.map(n => n.trim().split(/\s+/));

    // Nhóm các tên theo từ đầu tiên
    const groups = {};
    tokenized.forEach((words, i) => {
        const key = words[0].toLowerCase();
        if (!groups[key]) groups[key] = [];
        groups[key].push({ words, original: names[i] });
    });

    // Tìm nhóm lớn nhất (nhiều tên nhất)
    const dominantGroup = Object.values(groups)
        .sort((a, b) => b.length - a.length)[0];

    // Nếu nhóm lớn nhất < 50% tổng → không có prefix chung rõ ràng
    if (dominantGroup.length < names.length * 0.5) return null;

    // Tìm prefix chung dài nhất trong nhóm dominant
    const groupWords = dominantGroup.map(g => g.words);
    const minLen = Math.min(...groupWords.map(w => w.length));

    let commonLen = 0;
    for (let i = 0; i < minLen; i++) {
        const word = groupWords[0][i].toLowerCase();
        if (groupWords.every(w => w[i].toLowerCase() === word)) {
            commonLen = i + 1;
        } else {
            break;
        }
    }

    if (commonLen === 0) return dominantGroup[0].words[0]; // ít nhất lấy từ đầu

    // Giữ đúng case từ tên gốc đầu tiên trong nhóm
    return dominantGroup[0].words.slice(0, commonLen).join(" ");
}