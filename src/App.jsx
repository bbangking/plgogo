import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const USERS = [
  "장년회서기", // 관리자
  "1지역", "2지역", "3지역", "4지역", "5지역",
  "6지역", "7지역", "8지역", "9지역", "새신자"
];

export default function App() {
  const [currentUser, setCurrentUser] = useState("");
  const [inputs, setInputs] = useState({});
  const [newInput, setNewInput] = useState({ district: "", name: "" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        window.deferredPrompt = e;
      });
    }
  }, []);

  const isAdmin = currentUser === "장년회서기";

  const handleAdd = () => {
    if (!newInput.district || !newInput.name) return;
    const timestamp = new Date().toLocaleString();
    const userInputs = inputs[currentUser] || [];
    const updatedInputs = {
      ...inputs,
      [currentUser]: [...userInputs, { ...newInput, time: timestamp }],
    };
    setInputs(updatedInputs);
    setNewInput({ district: "", name: "" });
  };

  const handleDelete = (user, index) => {
    if (!isAdmin && user !== currentUser) return;
    const updated = [...(inputs[user] || [])];
    updated.splice(index, 1);
    const newInputs = { ...inputs, [user]: updated };
    if (updated.length === 0) {
      delete newInputs[user];
    }
    setInputs(newInputs);
  };

  const exportToExcel = () => {
    let exportData = [];
    Object.entries(inputs).forEach(([user, entries]) => {
      entries.forEach(entry => {
        exportData.push({ 사용자: user, 구역: entry.district, 이름: entry.name, 입력시간: entry.time });
      });
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "명단");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "명단.xlsx");
  };

  const exportToPDF = () => {
    const text = Object.entries(inputs)
      .map(([user, entries]) => {
        const lines = entries.map(e => `${e.district} / ${e.name} (${e.time})`).join("\n");
        return `[${user}]\n${lines}`;
      }).join("\n\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "명단.txt");
  };

  const sortedEntries = Object.entries(inputs)
    .filter(([user]) => isAdmin || user === currentUser)
    .sort(([a], [b]) => {
      const getOrder = (name) => USERS.indexOf(name);
      return getOrder(a) - getOrder(b);
    });

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {!currentUser && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="font-bold text-lg">사용자 선택</p>
            <div className="grid grid-cols-2 gap-2">
              {USERS.map(user => (
                <Button key={user} onClick={() => setCurrentUser(user)} className="text-base py-3">
                  {user}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentUser && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex justify-between items-center">
              <p className="font-bold text-lg">사용자: {currentUser}</p>
              <Button variant="outline" onClick={() => setCurrentUser("")} className="text-sm">다시 선택</Button>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="구역 입력"
                value={newInput.district}
                onChange={e => setNewInput({ ...newInput, district: e.target.value })}
                className="text-base p-3"
              />
              <Input
                placeholder="이름 입력"
                value={newInput.name}
                onChange={e => setNewInput({ ...newInput, name: e.target.value })}
                className="text-base p-3"
              />
              <Button onClick={handleAdd} className="text-base py-3">입력 추가</Button>
            </div>

            {isAdmin && (
              <div className="flex justify-between pt-4">
                <Button onClick={exportToExcel} className="text-sm">엑셀로 내보내기</Button>
                <Button onClick={exportToPDF} className="text-sm">PDF로 내보내기</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentUser && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="font-bold text-lg">{isAdmin ? "전체 명단 보기 (관리자)" : "내 명단 보기"}</p>
            {sortedEntries.map(([user, entries]) => (
              <div key={user} className="space-y-1">
                <p className="font-semibold text-base">[{user}]</p>
                {entries
                  .sort((a, b) => a.district.localeCompare(b.district))
                  .map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between border rounded p-2 gap-2"
                    >
                      <span className="text-sm sm:text-base">{entry.district} / {entry.name} ({entry.time})</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(user, idx)}
                        className="w-full sm:w-auto"
                      >
                        삭제
                      </Button>
                    </div>
                  ))}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}