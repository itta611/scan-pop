import { useAtom } from "jotai";
import { messageAtom, titleAtom } from "@/jotai/atoms";
import { Textarea } from "../../components/ui/textarea";
import { SettingField, SettingLabel } from "./setting-field";

export function TextSetting() {
  const [title, setTitle] = useAtom(titleAtom);
  const [message, setMessage] = useAtom(messageAtom);
  return (
    <SettingField title="画面のテキスト">
      <SettingLabel htmlFor="screen-title">見出し</SettingLabel>
      <Textarea
        id="screen-title"
        className="min-h-9"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
      />
      <SettingLabel htmlFor="screen-message">ひとことメッセージ</SettingLabel>
      <Textarea
        id="screen-message"
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
        maxLength={120}
        rows={2}
      />
    </SettingField>
  );
}
