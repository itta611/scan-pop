import { useScreenSetting } from "@/hooks/use-screen-setting";
import { urlAtom } from "@/jotai/atoms";
import { Input } from "../../components/ui/input";
import { SettingField } from "./setting-field";

export function LinkSetting() {
  const [url, saveUrl, setUrl] = useScreenSetting(urlAtom);
  return (
    <SettingField title="リンク先">
      <Input
        type="url"
        value={url}
        placeholder="https://example.com"
        onChange={(e) => setUrl(e.currentTarget.value)}
        onBlur={(e) => saveUrl(e.currentTarget.value)}
        autoComplete="url"
        maxLength={2048}
      />
    </SettingField>
  );
}
