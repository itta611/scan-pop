import { useScreenSetting } from "@/hooks/use-screen-setting";
import { urlAtom } from "@/jotai/atoms";
import { Input } from "../../components/ui/input";
import { SettingField } from "./setting-field";

export function LinkSetting() {
  const [url, setUrl] = useScreenSetting(urlAtom);
  return (
    <SettingField title="リンク先">
      <Input
        type="url"
        defaultValue={url}
        placeholder="https://example.com"
        onBlur={(e) => setUrl(e.currentTarget.value)}
        autoComplete="url"
        maxLength={2048}
      />
    </SettingField>
  );
}
