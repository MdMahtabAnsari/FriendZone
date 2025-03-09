import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import CustomInput from "../components/Input.jsx";
import CustomSkeleton from "../components/Skeleton.jsx";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/CustomInput">
                <CustomInput/>
            </ComponentPreview>
            <ComponentPreview path="/CustomSkeleton">
                <CustomSkeleton/>
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews