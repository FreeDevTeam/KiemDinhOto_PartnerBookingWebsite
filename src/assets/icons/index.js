import { createThemeIcon } from '../../helper/createThemeIcon';

import { ReactComponent as ArrowLeftBIDV } from './BIDV/arrow-left.svg';
import { ReactComponent as ArrowRightBIDV } from './BIDV/arrow-right.svg';
import { ReactComponent as ArrowLeftDefault } from './arrows.svg';
import { ReactComponent as HeaderBackBIDV } from './BIDV/header-back.svg';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import CarDefaultPath from './car.png';
import OtherVehiclesDefaultPath from './otherVehicles.png';
import { ReactComponent as HelpTextSVG } from './iconHepText.svg';
import { ReactComponent as HelpTextFillSVG } from './iconHepTextFill.svg';

import CarBIDVPath from './BIDV/vehicleCar.png';
import OtherVehiclesBIDVPath from './BIDV/vehicleOther.png';

export const IconArrowLeft = createThemeIcon({
  default: LeftOutlined,
  BIDV: ArrowLeftBIDV
});

export const IconArrowRight = createThemeIcon({
  default: RightOutlined,
  BIDV: ArrowRightBIDV
});


export const IconHeaderBack = createThemeIcon({
  default: ArrowLeftDefault,
  BIDV: HeaderBackBIDV
});

const ImgCarDefault = (props) => <img src={CarDefaultPath} {...props} alt="car" />;
const ImgOtherVehiclesDefault = (props) => <img src={OtherVehiclesDefaultPath} {...props} alt="other vehicles" />;
const ImgCarBIDV = (props) => <img src={CarBIDVPath} {...props} alt="car" />;
const ImgOtherVehiclesBIDV = (props) => <img src={OtherVehiclesBIDVPath} {...props} alt="other vehicles" />;

export const IconCar = createThemeIcon({
  default: ImgCarDefault,
  BIDV: ImgCarBIDV
});

export const IconOtherVehicles = createThemeIcon({
  default: ImgOtherVehiclesDefault,
  BIDV: ImgOtherVehiclesBIDV
});

export const IconHelpText = createThemeIcon({
  default: HelpTextSVG
});

export const IconHelpTextFill = createThemeIcon({
  default: HelpTextFillSVG
});
