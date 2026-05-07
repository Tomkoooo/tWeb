import mongoose, { Document, Model, Schema } from "mongoose"

export interface IThemeSetting extends Document {
  key: string
  colors: Record<string, string>
}

const ThemeSettingSchema = new Schema<IThemeSetting>(
  {
    key: { type: String, required: true, unique: true, default: "theme" },
    colors: { type: Schema.Types.Mixed, required: true, default: {} },
  },
  { timestamps: true }
)

const ThemeSetting: Model<IThemeSetting> =
  mongoose.models.ThemeSetting || mongoose.model<IThemeSetting>("ThemeSetting", ThemeSettingSchema)

export default ThemeSetting
