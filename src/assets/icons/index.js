import React from 'react';
import { createThemeIcon } from '../../helper/createThemeIcon';

import { ReactComponent as ArrowLeftBIDV } from './BIDV/arrow-left.svg';
import { ReactComponent as ArrowRightBIDV } from './BIDV/arrow-right.svg';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import CarDefaultPath from './car.png';
import OtherVehiclesDefaultPath from './otherVehicles.png';

// Khi nào có icon cho BIDV thì anh import vào đây, ví dụ:
// import { ReactComponent as CarBIDV } from './BIDV/car.svg';
// import { ReactComponent as OtherVehiclesBIDV } from './BIDV/moto.svg';

export const IconArrowLeft = createThemeIcon({
  default: LeftOutlined,
  BIDV: ArrowLeftBIDV
});

export const IconArrowRight = createThemeIcon({
  default: RightOutlined,
  BIDV: ArrowRightBIDV
});

const ImgCarDefault = (props) => <img src={CarDefaultPath} {...props} alt="car" />;
const ImgOtherVehiclesDefault = (props) => <img src={OtherVehiclesDefaultPath} {...props} alt="other vehicles" />;

export const IconCar = createThemeIcon({
  default: ImgCarDefault,
  // BIDV: CarBIDV
});

export const IconOtherVehicles = createThemeIcon({
  default: ImgOtherVehiclesDefault,
  // BIDV: OtherVehiclesBIDV
});
