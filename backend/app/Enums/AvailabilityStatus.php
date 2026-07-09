<?php

namespace App\Enums;

enum AvailabilityStatus: string
{
    case ACTIVE = 'active';
    case OOO = 'ooo';
    case IN_MEETINGS = 'in_meetings';
    case DEEP_WORK = 'deep_work';
}
