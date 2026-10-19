import { useAtom } from "jotai";
import { urlAtom } from "@/jotai/atoms";
import { Input } from "../../components/ui/input";
import { SettingField } from "./setting-field";

export function LinkSetting() {
  const [url, setUrl] = useAtom(urlAtom);
  return (
    <SettingField title="リンク先">
      <Input
        type="url"
        value={url}
        placeholder="https://example.com"
        onChange={(e) => setUrl(e.currentTarget.value)}
        autoComplete="url"
        maxLength={2048}
      />
    </SettingField>
  );
}
