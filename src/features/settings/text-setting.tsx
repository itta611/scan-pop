import { useScreenSetting } from "@/hooks/use-screen-setting";
import { messageAtom, titleAtom } from "@/jotai/atoms";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { SettingField, SettingLabel } from "./setting-field";

export function TextSetting() {
  const [title, setTitle] = useScreenSetting(titleAtom);
  const [message, setMessage] = useScreenSetting(messageAtom);
  return (
    <SettingField title="画面のテキスト">
      <SettingLabel htmlFor="screen-title">見出し</SettingLabel>
      <Input
        id="screen-title"
        defaultValue={title}
        onBlur={(e) => setTitle(e.currentTarget.value)}
      />
      <SettingLabel htmlFor="screen-message">ひとことメッセージ</SettingLabel>
      <Textarea
        id="screen-message"
        defaultValue={message}
        onBlur={(e) => setMessage(e.currentTarget.value)}
        maxLength={120}
        rows={2}
      />
    </SettingField>
  );
}
