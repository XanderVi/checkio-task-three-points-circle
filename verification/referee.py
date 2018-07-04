from checkio.signals import ON_CONNECT
from checkio import api
from checkio.referees.io import CheckiOReferee
from tests import TESTS

api.add_listener(
    ON_CONNECT,
    CheckiOReferee(
        tests=TESTS,
        function_name={
            "python": "circle",
            "js": "circle"
        },
        cover_code={
            #'python-3': cover_codes.unwrap_args,
            #'js-node': cover_codes.js_unwrap_args
        }
    ).on_ready)
